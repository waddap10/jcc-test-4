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
import AppLayout from '@/layouts/app-layout';

/**
 * ─── TypeScript Interfaces ─────────────────────────────────────────────────────
 */
interface Venue {
  id: number;
  name: string;
  address?: string;
}

interface Department {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Beo {
  id: number;
  status: string;
  pic?: string;
  phone?: string;
  description?: string;
  department: Department;
  user?: User;
}

interface Schedule {
  id: number;
  start_date?: string
  end_date?: string
  date?: string;           // ISO date string
  time_start?: string;     // time string
  time_end?: string;       // time string
  time?: string;           // ISO datetime string (if single time field)
  description: string;
  venue?: Venue;
  function?: number;
  setup?: string;
  people?: number;
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
  beos: Beo[];
  schedules: Schedule[];
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

  const functionLabels: Record<number, string> = {
    1: 'Loading In',
    2: 'Show',
    3: 'Loading Out',
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

  const breadcrumbs = [
    { title: 'Dashboard', href: route('kanit.dashboard') },
    { title: `BEO: ${order.event_name}`, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`BEO: ${order.event_name}`} />
      <div className="space-y-6 p-6">
        {/* Title */}
        <h1 className="text-3xl font-bold">BEO: {order.event_name}</h1>

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
                    <TableHead>Date</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Function</TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead className="text-right">People</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.schedules?.length > 0 ? (
                    order.schedules.map((schedule) => (
                      <TableRow key={schedule.id} className="hover:bg-gray-50">
                        {/* Date - show range or single date */}
                        <TableCell>
                          {(() => {
                            if (!schedule.start_date && !schedule.end_date) return 'N/A';

                            const startDate = schedule.start_date ? parseISO(schedule.start_date) : null;
                            const endDate = schedule.end_date ? parseISO(schedule.end_date) : null;

                            if (!startDate && !endDate) return 'N/A';
                            if (!endDate && startDate) return format(startDate, 'dd/MM/yy');
                            if (!startDate && endDate) return format(endDate, 'dd/MM/yy');

                            // If same day, show one date; otherwise show a range
                            return startDate && endDate && startDate.getTime() === endDate.getTime()
                              ? format(startDate, 'dd/MM/yy')
                              : `${startDate ? format(startDate, 'dd/MM/yy') : 'N/A'} – ${endDate ? format(endDate, 'dd/MM/yy') : 'N/A'}`;
                          })()}
                        </TableCell>

                        {/* Time Range - HH:mm format */}
                        <TableCell>
                          {schedule.time_start && schedule.time_end ? (
                            `${formatTime(schedule.time_start)} – ${formatTime(schedule.time_end)}`
                          ) : 'N/A'}
                        </TableCell>

                        {/* Venue */}
                        <TableCell>
                          {schedule.venue?.name || 'N/A'}
                        </TableCell>

                        {/* Function - map enum to label */}
                        <TableCell>
                          {schedule.function !== undefined && schedule.function !== null
                            ? (functionLabels[schedule.function as keyof typeof functionLabels] ?? 'Unknown')
                            : '—'
                          }
                        </TableCell>

                        {/* Setup */}
                        <TableCell>
                          {schedule.setup || '—'}
                        </TableCell>

                        {/* People - right aligned */}
                        <TableCell className="text-right">
                          {schedule.people || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
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
                    <TableHead>PIC</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.beos?.length > 0 ? (
                    order.beos.map((beo, index) => (
                      <TableRow key={beo.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{beo.department.name}</TableCell>
                        <TableCell>{beo.pic || beo.user?.name || 'N/A'}</TableCell>
                        <TableCell>{beo.phone || 'N/A'}</TableCell>

                        <TableCell>{beo.description || 'N/A'}</TableCell>
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
        
      </div>
    </AppLayout>
  );
}