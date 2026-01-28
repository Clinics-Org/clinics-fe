import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal } from '../components/ui';
import { Card, CardContent } from '../components/ui/Card';
import { patientService } from '../services/patientService';
import { toast } from '../utils/toast';
import type { Patient } from '../types';

export default function AllPatientsScreen() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: '' as 'M' | 'F' | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const filterPatients = () => {
      let filtered = [...patients];

      // Apply search filter only
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (patient) =>
            patient.name.toLowerCase().includes(query) ||
            patient.mobile.includes(searchQuery)
        );
      }

      setFilteredPatients(filtered);
    };

    filterPatients();
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading patients...');
      const allPatients = await patientService.getAll();
      console.log('📊 Patients loaded:', {
        count: allPatients.length,
        patients: allPatients,
        firstPatient: allPatients[0] ? {
          id: allPatients[0].id,
          name: allPatients[0].name,
          keys: Object.keys(allPatients[0]),
          mobile: allPatients[0].mobile,
          phone: (allPatients[0] as any).phone,
          mobileNumber: (allPatients[0] as any).mobileNumber,
        } : null,
      });
      setPatients(allPatients);
      setFilteredPatients(allPatients);
      console.log('✅ State updated - patients:', allPatients.length, 'filtered:', allPatients.length);
    } catch (error) {
      console.error('❌ Failed to load patients:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Loading complete');
    }
  };


  const handleAddNewPatient = () => {
    setIsModalOpen(true);
    setNewPatient({ name: '', mobile: '', age: '', gender: '' });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!newPatient.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!newPatient.mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
    } else if (!/^\d{10}$/.test(newPatient.mobile)) {
      newErrors.mobile = 'Mobile must be 10 digits';
    }
    if (!newPatient.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (newPatient.age && (isNaN(Number(newPatient.age)) || Number(newPatient.age) < 0)) {
      newErrors.age = 'Age must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePatient = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔄 Creating patient...');
      const patient = await patientService.create({
        name: newPatient.name.trim(),
        mobile: newPatient.mobile.trim(),
        age: newPatient.age ? Number(newPatient.age) : undefined,
        gender: newPatient.gender as 'M' | 'F', // Gender is required, validated in form
      });

      console.log('✅ Patient created:', patient);

      // Show success message
      toast.success('Patient created successfully!');

      // Close modal
      setIsModalOpen(false);

      // Reload patients list to show the new patient
      await loadPatients();
    } catch (error: any) {
      console.error('❌ Failed to create patient:', error);
      toast.error(error?.message || 'Failed to create patient. Please try again.');
    }
  };

  const maskMobile = (mobile: string | undefined): string => {
    if (!mobile || typeof mobile !== 'string') return 'N/A';
    if (mobile.length <= 4) return mobile;
    return '****' + mobile.slice(-4);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading patients...</div>
      </div>
    );
  }

  // Debug info
  console.log('🔍 Render Debug:', {
    patientsCount: patients.length,
    filteredCount: filteredPatients.length,
    loading,
    searchQuery,
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-teal-900">All Patients</h1>
            <p className="text-gray-600 mt-1">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
              {searchQuery && ` found`}
            </p>
          </div>
          <Button onClick={handleAddNewPatient} className="w-full sm:w-auto">
            + Add New Patient
          </Button>
        </div>

        <Card className="border-teal-200 mb-6">
          <CardContent className="pt-6">
            <Input
              type="text"
              placeholder="Search patients by name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Debug info - remove in production */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <strong>Debug:</strong> Patients: {patients.length}, Filtered: {filteredPatients.length}, Loading: {loading ? 'Yes' : 'No'}
          </div>
        )}

        {filteredPatients.length > 0 ? (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="border-teal-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/patient/${patient.id}`)}
              > 
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {patient.name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                        {patient.mobile && (
                          <span className="whitespace-nowrap">📱 {maskMobile(patient.mobile)}</span>
                        )}
                        <span className="whitespace-nowrap">
                          👤 Age: {patient.age !== undefined && patient.age !== null ? patient.age : 'N/A'}
                        </span>
                        {patient.gender && (
                          <span className="whitespace-nowrap">
                            {patient.gender === 'M' ? '♂' : '♀'} {patient.gender === 'M' ? 'Male' : 'Female'}
                          </span>
                        )}
                        {patient.createdAt && (
                          <span className="whitespace-nowrap">📅 Joined: {formatDate(patient.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-teal-200">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                {searchQuery ? (
                  <>
                    <p className="text-lg font-medium mb-2">No patients found</p>
                    <p className="text-sm">
                      Try a different search term or{' '}
                      <button
                        onClick={() => navigate('/visits')}
                        className="text-teal-600 hover:text-teal-700 underline"
                      >
                        add a new patient
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No patients yet</p>
                    <p className="text-sm mb-4">
                      Get started by adding your first patient
                    </p>
                    <Button onClick={() => navigate('/visits')}>
                      + Add New Patient
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Add New Patient"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePatient}>Save Patient</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Name *"
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            error={errors.name}
            placeholder="Enter patient name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSavePatient();
              }
            }}
          />
          <Input
            label="Mobile *"
            type="tel"
            value={newPatient.mobile}
            onChange={(e) => setNewPatient({ ...newPatient, mobile: e.target.value })}
            error={errors.mobile}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSavePatient();
              }
            }}
          />
          <Input
            label="Age"
            type="number"
            value={newPatient.age}
            onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
            error={errors.age}
            placeholder="Enter age (optional)"
            min="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSavePatient();
              }
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={newPatient.gender === 'M'}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
                  className="mr-2"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={newPatient.gender === 'F'}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
                  className="mr-2"
                />
                Female
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
