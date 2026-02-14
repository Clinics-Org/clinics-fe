import CreateAppointmentDialog from '@/components/dashboard/create-appointment-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { useFilters } from '@/hooks';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';
import {
  useAppointments,
  useUpdateAppointmentStatus,
} from '@/queries/appointments.queries';
import { useCurrentClinic } from '@/queries/clinic.queries';
import { APPOINTMENT_STATUS, type Appointment } from '@/types';
import { formatTimeShort } from '@/utils/date-format';
import dayjs from 'dayjs';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import { useMemo } from 'react';

const STATUS_LABEL = {
  WAITING: 'Waiting',
  CHECKED_IN: 'Checked In',
  NO_SHOW: 'No Show',
} as const;

const Lable = ({ status }: { status: keyof typeof APPOINTMENT_STATUS }) => {
  return (
    <span
      className={cn(`px-2 py-1 rounded-full text-xs font-normal text-white`, {
        'bg-yellow-500': status === APPOINTMENT_STATUS.WAITING,
        'bg-primary': status === APPOINTMENT_STATUS.CHECKED_IN,
        'bg-red-800': status === APPOINTMENT_STATUS.NO_SHOW,
      })}
    >
      {STATUS_LABEL[status]}
    </span>
  );
};

const formatAppointmentTime = (appointment: Appointment) => {
  if (appointment.slot) {
    const date = dayjs(appointment.slot.date).format('DD MMM YYYY');
    const time = formatTimeShort(appointment.slot.start_time);
    return `${date} | ${time}`;
  }
  if (appointment.appointment_date_time) {
    try {
      return dayjs(appointment.appointment_date_time).format(
        'DD MMM YYYY | hh:mm A',
      );
    } catch {
      return appointment.appointment_date_time;
    }
  }
  return '-';
};

export default function AppointmentsScreen() {
  const { data: clinic } = useCurrentClinic();
  const doctors = clinic?.doctors || [];
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();
  const createAppointmentsModal = useModal();

  const { values, updateFilter, updateMultipleFilters } = useFilters({
    initialValue: {
      SEARCH: '',
      DATE: '',
      DOCTOR_ID: 'all',
      PAGE: 1,
      PAGE_SIZE: 20,
    },
    useQueryParams: true,
  });

  const doctorId =
    values.DOCTOR_ID && values.DOCTOR_ID !== 'all'
      ? values.DOCTOR_ID
      : undefined;

  const { data: appointmentsResult, isLoading: loading } = useAppointments({
    page: values.PAGE,
    pageSize: values.PAGE_SIZE,
    date: values.DATE,
    doctorId: doctorId,
  });

  const totalCount = appointmentsResult?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / values.PAGE_SIZE));
  const filteredAppointments = useMemo(() => {
    const appointments = appointmentsResult?.appointments || [];
    if (!values.SEARCH.trim()) return appointments;
    const query = values.SEARCH.toLowerCase();
    return appointments.filter((appointment) => {
      const nameMatch = appointment.name?.toLowerCase().includes(query);
      const mobileMatch = appointment.mobile_number?.includes(query);
      return nameMatch || mobileMatch;
    });
  }, [values.SEARCH, appointmentsResult]);

  const handleMarkCheckIn = async (
    appointmentId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    await toast.promise(
      updateAppointmentStatusMutation.mutateAsync({
        appointmentId,
        status: APPOINTMENT_STATUS.CHECKED_IN,
      }),
      {
        loading: 'Marking appointment as checked in...',
        success: 'Appointment marked as checked in',
        error: (err) => err?.message || 'Failed to mark check in',
      },
    );
  };

  const selectedDoc = doctors.find((doc) => doc.id === values.DOCTOR_ID);

  return (
    <div className="h-screen bg-background overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
        {/* Header - Compact on Mobile */}
        <div className="mb-4 md:mb-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h6 className="text-sm md:text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarDays className="size-4" /> Appointments
              </h6>
            </div>
            <Button onClick={createAppointmentsModal.open} size="sm">
              + Create
            </Button>
          </div>
        </div>

        {/* Filters - Compact on Mobile */}
        <div className="mb-3 flex flex-col sm:flex-row gap-2 md:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or mobile..."
              defaultValue={values.SEARCH}
              onChange={(e) => updateFilter('SEARCH', e.target.value)}
            />
          </div>
          <div className="sm:w-40 md:w-48">
            <DatePicker
              value={values.DATE}
              onChange={(value) => {
                updateMultipleFilters({ DATE: value, PAGE: 1 });
              }}
              placeholder="Select date"
              className="w-full text-sm"
            />
          </div>
          {doctors.length > 0 && (
            <div className="flex flex-col items-start gap-2 sm:w-48 md:w-56">
              <Select.Root
                value={values.DOCTOR_ID || 'all'}
                onValueChange={(value) => {
                  updateMultipleFilters({ DOCTOR_ID: value || '', PAGE: 1 });
                }}
              >
                <Select.Trigger className="w-full text-sm">
                  <Select.Value placeholder="All Doctors">
                    {selectedDoc?.name}
                  </Select.Value>
                </Select.Trigger>

                <Select.Popup>
                  <Select.Item value="all">All Doctors</Select.Item>

                  {doctors.map((doc) => (
                    <Select.Item key={doc.id} value={doc.id}>
                      {doc.name}
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Root>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="text-xs md:text-sm text-gray-600">
            Page {values.PAGE} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => updateFilter('PAGE', Math.max(1, values.PAGE - 1))}
              disabled={values.PAGE <= 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => updateFilter('PAGE', Math.max(1, values.PAGE + 1))}
              disabled={values.PAGE >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="h-96 bg-background flex items-center justify-center">
            <div className="text-muted-foreground">Loading appointments...</div>
          </div>
        ) : (
          <>
            {filteredAppointments.length > 0 ? (
              <>
                {/* Desktop Table  View */}
                <Table.Root className="md:block hidden rounded-lg overflow-hidden">
                  <Table.Header className="bg-primary-foreground">
                    <Table.Row>
                      <Table.Head className="text-primary font-normal">
                        Name
                      </Table.Head>
                      <Table.Head className="text-primary font-normal">
                        Mobile
                      </Table.Head>
                      <Table.Head className="text-primary font-normal">
                        Doctor
                      </Table.Head>
                      <Table.Head className="text-primary font-normal">
                        Time
                      </Table.Head>
                      <Table.Head className="text-primary font-normal">
                        Status
                      </Table.Head>
                    </Table.Row>
                  </Table.Header>
                  {filteredAppointments.map((appointment) => {
                    const status = appointment.appointment_status;
                    return (
                      <Table.Row
                        key={appointment.id}
                        className="hover:bg-teal-50/50"
                      >
                        <Table.Cell className="min-w-62.5">
                          <h6 className="text-sm text-neutral-800 truncate flex-1 capitalize">
                            {appointment.name || '-'}
                          </h6>
                        </Table.Cell>
                        <Table.Cell className="min-w-62.5 text-sm text-neutral-800 truncate flex-1">
                          {appointment.mobile_number || '-'}
                        </Table.Cell>
                        <Table.Cell className="min-w-62.5 text-sm text-neutral-800 truncate flex-1 capitalize">
                          {appointment.doctor?.name || '-'}
                        </Table.Cell>
                        <Table.Cell className="min-w-62.5 text-sm text-neutral-800 truncate flex-1">
                          {formatAppointmentTime(appointment)}
                        </Table.Cell>
                        <Table.Cell className="min-w-62.5 text-sm text-neutral-800 truncate flex-1">
                          <div className="flex items-center gap-3 shrink-0">
                            <Lable status={status} />
                            {status === APPOINTMENT_STATUS.WAITING && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={
                                  updateAppointmentStatusMutation.isPending
                                }
                                onClick={(e) =>
                                  handleMarkCheckIn(appointment.id, e)
                                }
                                className="whitespace-nowrap"
                              >
                                Check In
                              </Button>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Root>

                {/* Mobile card view */}
                <div className="md:hidden grid gap-2 ">
                  {filteredAppointments.map((appointment) => (
                    <Card.Root
                      key={appointment.id}
                      className="border-neutral-200 transition-all md:border-0"
                    >
                      <Card.Panel className="p-3">
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-base text-neutral-800 truncate flex-1">
                                {appointment.name || 'Unknown'}
                              </h3>
                              {appointment.appointment_status ===
                                APPOINTMENT_STATUS.WAITING && (
                                <Button
                                  disabled={
                                    updateAppointmentStatusMutation.isPending
                                  }
                                  size="xs"
                                  onClick={(e) =>
                                    handleMarkCheckIn(appointment.id, e)
                                  }
                                  variant="outline"
                                >
                                  Check In
                                </Button>
                              )}
                            </div>

                            {appointment.mobile_number && (
                              <div className="text-xs text-muted-foreground">
                                Mobile: {appointment.mobile_number}
                              </div>
                            )}

                            {appointment.doctor && (
                              <div className="text-xs text-muted-foreground">
                                Doctor: {appointment.doctor.name}
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              {formatAppointmentTime(appointment) && (
                                <div className="text-xs text-muted-foreground">
                                  Time: {formatAppointmentTime(appointment)}
                                </div>
                              )}
                              <Lable status={appointment.appointment_status} />
                            </div>
                          </div>
                        </div>
                      </Card.Panel>
                    </Card.Root>
                  ))}
                </div>
              </>
            ) : (
              <Card.Root className="border-teal-200">
                <Card.Panel className="p-12 text-center">
                  <div className="text-gray-500">
                    {values.SEARCH ? (
                      <>
                        <p className="text-lg font-medium mb-2">
                          No appointments found
                        </p>
                        <p className="text-sm">Try a different search term</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium mb-2">
                          No appointments yet
                        </p>
                        <p className="text-sm">Appointments will appear here</p>
                      </>
                    )}
                  </div>
                </Card.Panel>
              </Card.Root>
            )}
          </>
        )}
      </div>

      <CreateAppointmentDialog {...createAppointmentsModal} />
    </div>
  );
}
