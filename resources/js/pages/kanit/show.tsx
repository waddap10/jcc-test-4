import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { format, parseISO, isValid } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

/**
 * ─── TypeScript Interfaces ─────────────────────────────────────────────────────
 */
interface Venue {
  id: number;
  name: string;
  short?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Package {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Attachment {
  id: number;
  file_name: string;
  created_at: string;
  url: string;
}

interface Beo {
  id: number;
  notes?: string;
  department: Department;
  package?: Package;
  user?: User;
  attachments: Attachment[];
}

interface Schedule {
  id: number;
  start_date?: string;
  end_date?: string;
  time_start?: string;
  time_end?: string;
  function?: string;
  notes?: string;
  setup?: string;
  people?: number;
  is_single_day?: boolean;
  date_range?: string;
}

interface Order {
  id: number;
  event_name: string;
  created_at: string | null;
  organizer: string;
  address: string;
  start_date: string | null;
  end_date: string | null;
  contact_person: string;
  phone: string;
  email: string;
  k_l_status?: boolean;
  status: number;
  status_beo: number;
  status_label?: string;
  beo_status_label?: string;
  notes?: string;
  beos: Beo[];
  schedules: Schedule[];
  venues: Venue[];
}

interface PageProps {
  order: Order;
  flash?: { message?: string };
  [key: string]: unknown;
}

/**
 * ─── Component ─────────────────────────────────────────────────────────────────
 */
export default function Show() {
  const { order, flash } = usePage<PageProps>().props;
  const { processing, delete: destroy, patch } = useForm();

  const functionLabels: Record<string, string> = {
    '1': 'Loading In',
    '2': 'Show',
    '3': 'Loading Out',
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined, formatStr: string = 'dd-MM-yyyy HH:mm'): string => {
    if (!dateString) return 'N/A';

    try {
      const parsedDate = parseISO(dateString);
      if (!isValid(parsedDate)) return 'Invalid Date';
      return format(parsedDate, formatStr);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const handleAccKanit = (o: Order) => {
    if (confirm(`Acc Kanit for #${o.id}?`)) {
      patch(route('kanit.acc-kanit', o.id));
    }
  };

  // Helper function to format time strings
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return 'N/A';

    // If it's already in HH:mm format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }

    // If it's in HH:mm:ss format, remove seconds
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5);
    }

    return timeString;
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: route('kanit.dashboard') },
    { title: `BEO: ${order.event_name}`, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`BEO: ${order.event_name}`} />
      <div className="space-y-6 p-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">BEO: {order.event_name}</h1>
          <div className="flex items-center gap-2">
            
          </div>
        </div>

        {/* Flash Message */}
        {flash?.message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {flash.message}
          </div>
        )}

        {/* Box 1 - Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Sender:</strong> admin</p>
            <p>
              <strong>Tanggal Dibuat:</strong>{' '}
              {formatDate(order.created_at)}
            </p>
            <p>
              <strong>Kepada:</strong>{' '}
              {order.beos?.length > 0 ? (
                order.beos.map((beo) => (
                  <Badge key={beo.id} className="mr-1 mb-1">
                    {beo.department.name}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">Tidak ada department</span>
              )}
            </p>
            {order.venues && order.venues.length > 0 && (
              <p>
                <strong>Venues:</strong>{' '}
                {order.venues.map((venue, index) => (
                  <span key={venue.id}>
                    {venue.name}{index < order.venues.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Box 2 - Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Organizer:</strong> {order.organizer || 'N/A'}</p>
            <p><strong>Address:</strong> {order.address || 'N/A'}</p>
            <p>
              <strong>Tanggal Event:</strong>{' '}
              {formatDate(order.start_date, 'dd-MM-yyyy')} – {formatDate(order.end_date, 'dd-MM-yyyy')}
            </p>
            <p><strong>Contact Person:</strong> {order.contact_person || 'N/A'}</p>
            <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
            <p><strong>Email:</strong> {order.email || 'N/A'}</p>
            {order.k_l_status !== undefined && (
              <p>
                <strong>K/L Status:</strong>{' '}
                <Badge className={order.k_l_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {order.k_l_status ? 'Yes' : 'No'}
                </Badge>
              </p>
            )}
            {order.notes && (
              <p><strong>Notes:</strong> {order.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Schedule List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Schedule</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                {order.schedules?.length > 0 && (
                  <TableCaption>All schedules for this order</TableCaption>
                )}

                <TableHeader>
                  <TableRow>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Function</TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead className="text-right">People</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.schedules?.length > 0 ? (
                    order.schedules.map((schedule) => (
                      <TableRow key={schedule.id} className="hover:bg-gray-50">
                        {/* Date Range */}
                        <TableCell>
                          {schedule.date_range || (
                            (() => {
                              if (!schedule.start_date && !schedule.end_date) return 'N/A';

                              const startDate = schedule.start_date ? parseISO(schedule.start_date) : null;
                              const endDate = schedule.end_date ? parseISO(schedule.end_date) : null;

                              if (!startDate && !endDate) return 'N/A';
                              if (!endDate && startDate) return format(startDate, 'dd/MM/yy');
                              if (!startDate && endDate) return format(endDate, 'dd/MM/yy');

                              return startDate && endDate && startDate.getTime() === endDate.getTime()
                                ? format(startDate, 'dd/MM/yy')
                                : `${startDate ? format(startDate, 'dd/MM/yy') : 'N/A'} – ${endDate ? format(endDate, 'dd/MM/yy') : 'N/A'}`;
                            })()
                          )}
                        </TableCell>

                        {/* Time Range */}
                        <TableCell>
                          {schedule.time_start && schedule.time_end ? (
                            `${formatTime(schedule.time_start)} – ${formatTime(schedule.time_end)}`
                          ) : 'N/A'}
                        </TableCell>

                        {/* Function */}
                        <TableCell>
                          {schedule.function 
                            ? (functionLabels[schedule.function] || schedule.function)
                            : '—'
                          }
                        </TableCell>

                        {/* Setup */}
                        <TableCell>
                          {schedule.setup || '—'}
                        </TableCell>

                        {/* People - right aligned */}
                        <TableCell className="text-right">
                          {schedule.people ? `${schedule.people} people` : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No schedules added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* BEOs List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Daftar BEO</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Attachments</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.beos?.length > 0 ? (
                    order.beos.map((beo, index) => (
                      <TableRow key={beo.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{beo.department.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {beo.package ? (
                            <div className="space-y-1">
                              <Badge variant="secondary">{beo.package.name}</Badge>
                              {beo.package.description && (
                                <div className="text-xs text-gray-600">
                                  {beo.package.description}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </TableCell>
                        <TableCell>{beo.user?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {beo.attachments && beo.attachments.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {beo.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                                  title={`Download ${attachment.file_name}`}
                                >
                                  <Download className="h-3 w-3" />
                                  <span className="max-w-20 truncate">{attachment.file_name}</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">No files</span>
                          )}
                        </TableCell>
                        <TableCell>{beo.notes || '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Tidak ada BEO.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleAccKanit(order)}
            disabled={processing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {processing ? 'Processing...' : 'Acc Kanit'}
          </Button>
          
          <Link href={route('kanit.dashboard')}>
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}