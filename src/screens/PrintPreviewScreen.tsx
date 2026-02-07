import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stepper } from '../components/ui/stepper';
import { visitService } from '../services/visitService';
import { patientService } from '../services/patientService';
import { prescriptionService } from '../services/prescriptionService';
import { printUtils } from '../utils/print';
import { visitSteps } from '../utils/visitStepper';
import { useClinic } from '../hooks/useClinic';
import type { Patient, Visit } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';

export default function PrintPreviewScreen() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'a4' | 'thermal'>('a4');
  const clinicName = clinic?.name || 'Clinic OPD Management';

  useEffect(() => {
    const loadData = async () => {
      if (!visitId) {
        navigate('/visits');
        return;
      }

      const currentVisit = await visitService.getById(visitId);
      if (!currentVisit) {
        navigate('/visits');
        return;
      }

      // If prescription_id exists, fetch the prescription data
      let prescription = null;
      if (currentVisit.prescription_id) {
        prescription = await prescriptionService.getById(
          currentVisit.prescription_id,
        );
      } else if (currentVisit.prescription) {
        // Fallback to visit.prescription if it exists
        prescription = currentVisit.prescription;
      }

      if (!prescription) {
        navigate('/visits');
        return;
      }

      // Set visit with prescription
      setVisit({ ...currentVisit, prescription });
      const patientData = await patientService.getById(currentVisit.patientId);
      setPatient(patientData);
    };

    loadData();
  }, [visitId, navigate]);

  const handlePrint = async () => {
    if (!visit || !patient || !visit.prescription) return;

    if (activeTab === 'a4') {
      printUtils.printA4(patient, visit, visit.prescription, clinicName);
    } else {
      printUtils.printThermal(patient, visit, visit.prescription, clinicName);
    }

    // Update visit status to completed after printing
    if (visitId) {
      await visitService.updateStatus(visitId, 'completed');
    }
  };

  if (!visit || !patient || !visit.prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const visitDate = new Date(visit.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Visit Progress Stepper */}
        <Card.Root className="mb-4 border-teal-200">
          <Card.Panel className="pt-4 pb-4">
            <Stepper steps={visitSteps} currentStep={visitSteps.length} />
          </Card.Panel>
        </Card.Root>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Print Preview
          </h1>
          <Button onClick={handlePrint} size="lg" className="w-full sm:w-auto">
            Print
          </Button>
        </div>

        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'a4' | 'thermal')}
        >
          <Tabs.List className="flex w-full overflow-x-auto border-b border-gray-200 mb-6 -mx-4 md:mx-0 px-4 md:px-0">
            <Tabs.Tab
              value="a4"
              className="shrink-0 px-4 md:px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 hover:text-gray-700"
            >
              A4 Prescription
            </Tabs.Tab>
            <Tabs.Tab
              value="thermal"
              className="shrink-0 px-4 md:px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 hover:text-gray-700"
            >
              Thermal
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="a4">
            <Card.Root className="p-4 md:p-8 bg-white overflow-x-auto">
              <div className="max-w-[210mm] mx-auto min-w-0">
                {/* A4 Layout */}
                <div className="text-center mb-6 md:mb-8 pb-3 md:pb-4 border-b-2 border-black">
                  <div className="text-lg md:text-2xl font-bold wrap-break-word">
                    {clinicName}
                  </div>
                </div>

                <div className="mb-6 space-y-2 text-sm md:text-base">
                  <p className="wrap-break-word">
                    <strong>Patient Name:</strong> {patient.name}
                  </p>
                  <p className="wrap-break-word">
                    <strong>Age:</strong> {patient.age || 'N/A'}{' '}
                    {patient.gender &&
                      `| Gender: ${patient.gender === 'M' ? 'Male' : 'Female'}`}
                  </p>
                  <p className="wrap-break-word">
                    <strong>Mobile:</strong> {patient.mobile}
                  </p>
                  <p className="wrap-break-word">
                    <strong>Date:</strong> {visitDate}
                  </p>
                </div>

                {visit.prescription.notes && (
                  <div className="mb-6 text-sm md:text-base wrap-break-word">
                    <strong>Notes:</strong> {visit.prescription.notes}
                  </div>
                )}

                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-gray-300 min-w-150">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-sm md:text-base">
                          Medicine
                        </th>
                        <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-sm md:text-base">
                          Dosage
                        </th>
                        <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-sm md:text-base">
                          Duration
                        </th>
                        <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-sm md:text-base">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visit.prescription.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-300 px-2 md:px-4 py-2 text-sm md:text-base wrap-break-word">
                            {med.name}
                          </td>
                          <td className="border border-gray-300 px-2 md:px-4 py-2 text-sm md:text-base wrap-break-word">
                            {med.dosage}
                          </td>
                          <td className="border border-gray-300 px-2 md:px-4 py-2 text-sm md:text-base wrap-break-word">
                            {med.duration}
                          </td>
                          <td className="border border-gray-300 px-2 md:px-4 py-2 text-sm md:text-base wrap-break-word">
                            {med.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {visit.prescription.followUp && (
                  <p className="mb-6">
                    <strong>Follow-up:</strong> After{' '}
                    {visit.prescription.followUp.value}{' '}
                    {visit.prescription.followUp.unit}
                  </p>
                )}

                <div className="mt-16 text-right">
                  <div className="inline-block border-t border-black w-48 mt-12"></div>
                  <p className="mt-2">Doctor's Signature</p>
                </div>
              </div>
            </Card.Root>
          </Tabs.Panel>

          <Tabs.Panel value="thermal">
            <Card.Root className="p-4 bg-white">
              <div className="max-w-[70mm] mx-auto font-mono text-xs">
                {/* Thermal Layout */}
                <div className="text-center mb-4 pb-2 border-b border-dashed border-black">
                  <div className="text-sm font-bold">{clinicName}</div>
                </div>

                <div className="mb-4 space-y-1 text-xs">
                  <div>
                    <strong>{patient.name}</strong>
                  </div>
                  <div>
                    {patient.age !== undefined && patient.age !== null
                      ? `Age: ${patient.age}`
                      : 'Age: N/A'}{' '}
                    {patient.gender &&
                      `| ${patient.gender === 'M' ? 'M' : 'F'}`}
                  </div>
                  <div>
                    {patient.mobile} |{' '}
                    {new Date(visit.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {visit.prescription.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="mb-3 pb-2 border-b border-dotted border-gray-400"
                  >
                    <div className="font-bold mb-1">{med.name}</div>
                    <div className="ml-1 text-xs">
                      {med.dosage} - {med.duration}
                      {med.notes && ` (${med.notes})`}
                    </div>
                  </div>
                ))}

                {visit.prescription.followUp && (
                  <div className="mt-4 text-center font-bold">
                    Follow-up: {visit.prescription.followUp.value}{' '}
                    {visit.prescription.followUp.unit}
                  </div>
                )}

                <div className="mt-8 text-center">
                  <div className="border-t border-black w-full my-4"></div>
                  <div className="text-xs">Doctor's Signature</div>
                </div>
              </div>
            </Card.Root>
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    </div>
  );
}
