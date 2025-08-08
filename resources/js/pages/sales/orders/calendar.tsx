// resources/js/Pages/Orders/Calendar.tsx

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { addMonths, format, subMonths } from 'date-fns';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

interface Venue {
  id: number;
  name: string;
  short: string;
}

interface Slot {
  order_id: number;
  schedule_id?: number;
  event_name: string;
  function?: string;
  display_text?: string;
  start: string;
  end: string;
  is_single_day?: boolean;
  date_range?: string;
  date_span?: string[];
  status: number; // 0, 1 or 2
  setup?: string;
}

interface VenueSchedule {
  name: string;
  slots: Slot[];
}

interface Props {
  venues: Venue[];
  calendarData: Record<number, VenueSchedule>;
  month: number;
  year: number;
  filters?: {
    date: string | null;
    venue: number | null;
    status: number | null;
  };
  statusOptions?: Array<{ value: number; label: string }>;
}

export default function Calendar({ venues, calendarData, month, year, filters, statusOptions }: Props) {
  // Provide default values for filters if undefined or missing properties
  const safeFilters = {
    date: filters?.date || null,
    venue: filters?.venue || null,
    status: filters?.status !== undefined ? filters.status : null,
  };
  
  const [filterDate, setFilterDate] = useState(safeFilters.date || '');
  const [filterVenue, setFilterVenue] = useState(safeFilters.venue || '');
  const [filterStatus, setFilterStatus] = useState(safeFilters.status !== null ? safeFilters.status?.toString() || '' : '');
  
  // Debug: Log received props
  React.useEffect(() => {
    console.log('Calendar props:', { venues: venues.length, month, year, filters, statusOptions });
    console.log('Calendar data slots count:', Object.values(calendarData).reduce((acc, venue) => acc + venue.slots.length, 0));
  }, [venues, month, year, filters, statusOptions, calendarData]);
  
  const current = new Date(year, month - 1, 1);
  const prev = subMonths(current, 1);
  const next = addMonths(current, 1);

  // Default status options if not provided
  const defaultStatusOptions = [
    { value: 0, label: 'New Inquiry' },
    { value: 1, label: 'Sudah Konfirmasi' },
    { value: 2, label: 'Sudah dilaksanakan' },
  ];
  
  const statusOpts = statusOptions && statusOptions.length > 0 ? statusOptions : defaultStatusOptions;

  // Helper function to get function name based on day position
  const getFunctionByPosition = (slot: Slot, currentDate: string): string => {
    // First, try to use the actual function value from the schedule record
    if (slot.function) {
      return getFunctionName(slot.function);
    }
    
    // Fallback to position-based logic only if no function is specified
    const startDate = slot.start.slice(0, 10);
    const endDate = slot.end.slice(0, 10);
    const isSingleDay = startDate === endDate;
    
    if (isSingleDay) {
      return 'Show';
    } else {
      if (currentDate === startDate) {
        return 'Loading In';
      } else if (currentDate === endDate) {
        return 'Loading Out';
      } else {
        return 'Show';
      }
    }
  };

  // Helper function to get function name (for legacy support)
  const getFunctionName = (functionValue: string) => {
    switch (functionValue) {
      case '1': return 'Loading In';
      case '2': return 'Show';
      case '3': return 'Loading Out';
      default: return functionValue;
    }
  };

  // Helper function to get status color and info
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: return { 
        label: 'New Inquiry', 
        bgcolor: '#A5D6A7', 
        bgClass: 'bg-green-100',
        textColor: 'text-green-800', 
        borderColor: 'border-green-200' 
      };
      case 1: return { 
        label: 'Sudah Konfirmasi', 
        bgcolor: '#FFF59D', 
        bgClass: 'bg-yellow-100',
        textColor: 'text-yellow-800', 
        borderColor: 'border-yellow-200' 
      };
      case 2: return { 
        label: 'Sudah dilaksanakan', 
        bgcolor: '#90CAF9', 
        bgClass: 'bg-blue-100',
        textColor: 'text-blue-800', 
        borderColor: 'border-blue-200' 
      };
      default: return { 
        label: 'Unknown', 
        bgcolor: '#E0E0E0', 
        bgClass: 'bg-gray-100',
        textColor: 'text-gray-800', 
        borderColor: 'border-gray-200' 
      };
    }
  };

  // Helper function to get status color (for backward compatibility)
  const getStatusColor = (status: number) => {
    const info = getStatusInfo(status);
    return `${info.bgClass} ${info.textColor} ${info.borderColor}`;
  };

  // Build a list of every day in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month - 1, i + 1);
    const iso = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    return { dateObj: d, iso };
  });

  const applyFilters = () => {
    const params = {
      month: month.toString(),
      year: year.toString(),
    };
    
    if (filterDate) {
      params.filter_date = filterDate;
      console.log('Setting filter_date:', filterDate);
    }
    if (filterVenue) {
      params.filter_venue = filterVenue.toString();
      console.log('Setting filter_venue:', filterVenue);
    }
    if (filterStatus !== '') {
      params.filter_status = filterStatus;
      console.log('Setting filter_status:', filterStatus);
    }
    
    console.log('Applying filters with params:', params);
    
    // Use router.get with object parameters
    router.get(route('orders.calendar'), params, {
      preserveState: false,
      preserveScroll: true
    });
  };

  const clearFilters = () => {
    router.get(route('orders.calendar'), { month, year }, {
      preserveState: false,
      preserveScroll: true
    });
  };

  const handleTodayClick = () => {
    const today = new Date();
    router.visit(route('orders.calendar', {
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    }));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Calendar', href: '/orders/calendar' }]}>
      <Head title="Venue Booking Calendar" />

      <div className="flex flex-col h-full">
        {/* Month navigation - NOT fixed, can scroll up */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          {/* Main navigation row */}
          <div className="flex items-center justify-between px-4 py-4">
            <Link
              href={route('orders.calendar', {
                month: prev.getMonth() + 1,
                year: prev.getFullYear(),
              })}
              className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 transition-colors"
            >
              ← {format(prev, 'MMM yyyy')}
            </Link>

            <h1 className="text-2xl font-semibold">{format(current, 'MMMM yyyy')}</h1>

            <Link
              href={route('orders.calendar', {
                month: next.getMonth() + 1,
                year: next.getFullYear(),
              })}
              className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 transition-colors"
            >
              {format(next, 'MMM yyyy')} →
            </Link>
          </div>
          
          {/* Filter row */}
          <div className="flex items-center justify-between px-4 pb-4 border-t border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="filter-date" className="text-sm font-medium text-gray-700">
                  Filter by date:
                </label>
                <Input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-40"
                />
              </div>

              {/* Venue Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="filter-venue" className="text-sm font-medium text-gray-700">
                  Venue:
                </label>
                <select
                  id="filter-venue"
                  value={filterVenue}
                  onChange={(e) => setFilterVenue(e.target.value)}
                  className="w-40 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Venues</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="filter-status" className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-40 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  {statusOpts.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={applyFilters}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleTodayClick}
                  variant="outline"
                  size="sm"
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {statusOpts.map((status) => {
                const statusInfo = getStatusInfo(status.value);
                return (
                  <div key={status.value} className="flex items-center gap-2">
                    <div 
                      className={`w-4 h-4 rounded border ${statusInfo.borderColor}`}
                      style={{ backgroundColor: statusInfo.bgcolor }}
                    ></div>
                    <span className="text-xs text-gray-600">{statusInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Filters Indicator */}
          {(filterDate || filterVenue || filterStatus !== '') && (
            <div className="flex items-center gap-2 text-sm text-blue-600 px-4 pb-2">
              <span className="font-medium">Active filters:</span>
              {filterDate && <span className="bg-blue-100 px-2 py-1 rounded">Date: {filterDate}</span>}
              {filterVenue && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Venue: {venues.find(v => v.id.toString() === filterVenue.toString())?.name}
                </span>
              )}
              {filterStatus !== '' && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Status: {statusOpts.find(s => s.value.toString() === filterStatus)?.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table container with sticky header */}
        <div className="flex-1 px-4 overflow-auto">
          <Table className="min-w-full table-fixed">
            <TableCaption className="sr-only">Availability for {format(current, 'MMMM yyyy')}</TableCaption>

            {/* Sticky Table Header */}
            <TableHeader className="sticky top-0 z-20 bg-white shadow-md border-b-2 border-gray-300">
              <TableRow className="divide-x divide-gray-200">
                <TableHead className="sticky left-0 z-30 w-16 min-w-16 border-r border-gray-200 bg-white font-semibold text-center text-xs">
                  Date
                </TableHead>
                {venues.map((v) => (
                  <TableHead 
                    key={v.id} 
                    className="w-24 min-w-24 bg-white text-center font-semibold px-1 text-xs" 
                    title={v.name}
                  >
                    {v.short}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map(({ dateObj, iso }, rowIndex) => (
                <TableRow 
                  key={iso} 
                  className={`divide-x divide-gray-200 hover:bg-gray-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <TableCell className="sticky left-0 z-10 w-16 min-w-16 border-r border-gray-200 bg-inherit font-medium text-center py-2 text-xs shadow-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold">{format(dateObj, 'd')}</span>
                      <span className="text-xs text-gray-500">{format(dateObj, 'EEE')}</span>
                    </div>
                  </TableCell>

                  {(() => {
                    const cells: React.ReactNode[] = [];
                    let i = 0;

                    // Filter slots per venue for current date
                    const scheduleMap = venues.reduce<Record<number, Slot[]>>((acc, v) => {
                      acc[v.id] = calendarData[v.id]?.slots.filter((s) => {
                        // Check if current date is within the schedule's date span
                        // Fallback to date comparison if date_span is not available
                        if (s.date_span && Array.isArray(s.date_span)) {
                          return s.date_span.includes(iso);
                        } else {
                          // Fallback method: check if current date is between start and end
                          const startDate = s.start.slice(0, 10);
                          const endDate = s.end.slice(0, 10);
                          return startDate <= iso && iso <= endDate;
                        }
                      }) ?? [];
                      return acc;
                    }, {});

                    // Walk through venues, merging adjacent same-schedule cells
                    while (i < venues.length) {
                      const vid = venues[i].id;
                      const hits = scheduleMap[vid];

                      if (!hits.length) {
                        cells.push(
                          <TableCell key={`${vid}-empty`} className="w-24 min-w-24 text-center py-2 text-gray-400 text-xs">
                            <span className="text-xs"></span>
                          </TableCell>
                        );
                        i++;
                        continue;
                      }

                      // Find how many consecutive venues share this schedule
                      const scheduleId = hits[0].schedule_id || hits[0].order_id; // Fallback to order_id
                      let span = 1;
                      while (
                        i + span < venues.length &&
                        scheduleMap[venues[i + span].id].some((s) => 
                          (s.schedule_id || s.order_id) === scheduleId
                        )
                      ) {
                        span++;
                      }

                      // Get status info
                      const statusInfo = getStatusInfo(hits[0].status);

                      // Create display text with function based on day position
                      let displayText = '';
                      let functionName = '';
                      
                      if (hits[0].display_text) {
                        // Use new format if available
                        displayText = hits[0].event_name || 'Event';
                        functionName = getFunctionByPosition(hits[0], iso);
                      } else {
                        // Build from available legacy fields
                        displayText = hits[0].event_name || `Order #${hits[0].order_id}`;
                        functionName = getFunctionByPosition(hits[0], iso);
                      }

                      const fullDisplayText = `${displayText} - ${functionName}`;

                      // Determine if this is the start, middle, or end of a multi-day event
                      const isSingleDay = hits[0].is_single_day !== undefined 
                        ? hits[0].is_single_day 
                        : hits[0].start.slice(0, 10) === hits[0].end.slice(0, 10); // Fallback calculation

                      cells.push(
                        <TableCell 
                          key={`${vid}-${scheduleId}`} 
                          colSpan={span} 
                          className={`w-24 min-w-24 p-1 text-center border ${statusInfo.bgClass} ${statusInfo.textColor} ${statusInfo.borderColor} text-xs`}
                          style={{ backgroundColor: statusInfo.bgcolor }}
                        >
                          <div className="text-xs font-medium leading-tight break-words">
                            {fullDisplayText}
                          </div>
                          {!isSingleDay && hits[0].date_range && (
                            <div className="text-xs text-gray-600 mt-1">
                              {/* {hits[0].date_range} */}
                            </div>
                          )}
                        </TableCell>
                      );

                      i += span;
                    }

                    return cells;
                  })()}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}