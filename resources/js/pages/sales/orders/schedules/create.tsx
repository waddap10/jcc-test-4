import React, { useState, useEffect } from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import Calendar, { CalendarProps } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
  parseISO,
  format,
  isWithinInterval,
  subDays,
  addDays,
  parse,
  addHours,
  isBefore,
  isAfter,
} from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'


import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import TimePicker from 'rc-time-picker'
import 'rc-time-picker/assets/index.css'
import moment from 'moment'

// Helper to turn "HH:mm:ss" into a Moment or undefined
const toMoment = (t: string) =>
  t ? moment(t, 'HH:mm') : undefined


interface Schedule {
  id: number
  start_date: string
  end_date: string
}

interface Order {
  id: number
  event_name: string
  start_date: string
  end_date: string
  schedules?: Schedule[]
}

interface ScheduleForm extends Record<string, string> {
  start_date: string
  end_date: string
  time_start: string
  time_end: string
  function: string
  setup: string
  people: string
}

export default function Create() {
  const { order, flash = {}, errors = {} } = usePage<{
    order: Order
    flash?: { message?: string }
    errors: Record<string, string>
  }>().props

  // Inertia form state: an array of schedule entries
  const { data, setData, post, processing } = useForm<{
    schedules: ScheduleForm[]
  }>({
    schedules: [
      {
        start_date: '',
        end_date: '',
        time_start: '',
        time_end: '',
        function: '',
        setup: '',
        people: '',
      },
    ],
  })

  // Local calendar state: one [start,end] per row
  const [selectedRanges, setSelectedRanges] = useState<
    [Date | null, Date | null][]
  >(
    data.schedules.map((sch) => [
      sch.start_date ? parseISO(sch.start_date) : null,
      sch.end_date ? parseISO(sch.end_date) : null,
    ])
  )

  // Keep selectedRanges in sync when rows are added/removed
  useEffect(() => {
    setSelectedRanges((prev) => {
      const next: [Date | null, Date | null][] = data.schedules.map(
        (sch, i) =>
          prev[i] ||
          [
            sch.start_date ? parseISO(sch.start_date) : null,
            sch.end_date ? parseISO(sch.end_date) : null,
          ]
      )
      return next
    })
  }, [data.schedules.length])

  // Build blocked intervals from existing schedules
  const blockedIntervals = (order.schedules ?? []).map((s) => {
    return { start: parseISO(s.start_date), end: parseISO(s.end_date) }
  })

  // Patch one field in one schedule row
  function updateSchedule(
    idx: number,
    field: keyof ScheduleForm,
    value: string
  ) {
    console.log(`Updating schedule ${idx}, field: ${field}, value: ${value}`); // Debug log
    const next = data.schedules.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    )
    console.log('New schedules array:', next); // Debug log
    setData('schedules', next)
  }

  // Patch both start_date + end_date and local range
  function setEntireRange(idx: number, start: Date, end: Date) {
    const s = format(start, 'yyyy-MM-dd')
    const e = format(end, 'yyyy-MM-dd')

    // Build the new schedules array in one go
    const nextSchedules = data.schedules.map((row, i) =>
      i === idx
        ? { ...row, start_date: s, end_date: e }
        : row
    )

    // Single setData call → preserves both updates
    setData('schedules', nextSchedules)

    // Still update your local calendar highlights
    setSelectedRanges((prev) => {
      const copy = [...prev]
      copy[idx] = [start, end]
      return copy
    })
  }

  // Calendar onChange: handle Date OR [Date,Date]
  function handleRangeChange(idx: number): CalendarProps['onChange'] {
    return (value) => {
      if (value instanceof Date) {
        // single click → 1-day range
        setEntireRange(idx, value, value)
      } else if (
        Array.isArray(value) &&
        value[0] instanceof Date &&
        value[1] instanceof Date
      ) {
        setEntireRange(idx, value[0], value[1])
      }
    }
  }

  // Helper function to filter available end times
  const filterEndTimes = (time: Date, startTime: string) => {
    if (!startTime) return false
    
    const startDate = parse(startTime, 'HH:mm', new Date())
    const maxEndDate = addHours(startDate, 12)
    
    // Handle case where max time crosses midnight
    if (maxEndDate.getDate() > startDate.getDate()) {
      // Time spans across midnight
      return time > startDate || time <= maxEndDate
    } else {
      // Normal case - same day
      return time > startDate && time <= maxEndDate
    }
  }

  // Add / Remove schedule rows
  const addSchedule = () => {
    setData('schedules', [
      ...data.schedules,
      {
        start_date: '',
        end_date: '',
        time_start: '',
        time_end: '',
        function: '',
        setup: '',
        people: '',
      },
    ])
    setSelectedRanges((prev) => [...prev, [null, null]])
  }
  const removeSchedule = (idx: number) => {
    setData(
      'schedules',
      data.schedules.filter((_, i) => i !== idx)
    )
    setSelectedRanges((prev) => prev.filter((_, i) => i !== idx))
  }

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('orders.schedules.store', order.id))
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: route('orders.index') },
    {
      title: `Schedules for ${order.event_name}`,
      href: route('orders.schedules.index', order.id),
    },
    { title: 'Create', href: '' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`New Schedule – ${order.event_name}`} />

      <div className="space-y-6 px-6 py-4">
        {flash.message && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{flash.message}</AlertDescription>
          </Alert>
        )}

        <h1 className="text-xl font-semibold">
          Add Schedule(s) to "{order.event_name}"
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {data.schedules.map((sch, idx) => (
            <div key={idx} className="border rounded p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Schedule #{idx + 1}</h2>
                {data.schedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSchedule(idx)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Calendar Picker */}
                <Calendar
                  selectRange
                  value={selectedRanges[idx] as any}
                  onChange={handleRangeChange(idx)}
                  minDate={parseISO(order.start_date)}
                  maxDate={parseISO(order.end_date)}
                  tileClassName={({ date, view }) => {
                    if (view !== 'month') return
                    if (
                      blockedIntervals.some((i) =>
                        isWithinInterval(date, i)
                      )
                    ) {
                      return 'bg-yellow-200'
                    }
                    const [s, e] = selectedRanges[idx] || []
                    if (s && e && date >= s && date <= e) {
                      return 'bg-blue-200'
                    }
                  }}
                />

                {/* Left-side fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Time Picker */}
                    <div>
                      <label className="block font-medium mb-1">Start Time</label>
                      <DatePicker
                        selected={
                          sch.time_start
                            ? parse(sch.time_start, 'HH:mm', new Date())
                            : null
                        }
                        onChange={(date) => {
                          console.log('Start time selected:', date); // Debug log
                          if (date) {
                            const timeString = format(date, 'HH:mm');
                            console.log('Formatted time string:', timeString); // Debug log
                            
                            // Update both start time and clear end time in single call
                            const next = data.schedules.map((row, i) =>
                              i === idx 
                                ? { ...row, time_start: timeString, time_end: '' }
                                : row
                            )
                            setData('schedules', next)
                          }
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="HH:mm"
                        className="w-full rounded border px-3 py-2"
                        placeholderText="Select start…"
                      />
                      {/* Debug display */}
                      <div className="text-xs text-gray-500 mt-1">
                        Current value: {sch.time_start || 'empty'}
                      </div>
                    </div>

                    {/* End Time Picker */}
                    <div>
                      <label className="block font-medium mb-1">End Time</label>
                      <DatePicker
                        selected={
                          sch.time_end
                            ? parse(sch.time_end, 'HH:mm', new Date())
                            : null
                        }
                        onChange={(date) => {
                          if (date) {
                            updateSchedule(
                              idx,
                              'time_end',
                              format(date, 'HH:mm')
                            )
                          }
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="HH:mm"
                        className="w-full rounded border px-3 py-2"
                        placeholderText="Select end…"
                        disabled={!sch.time_start}
                        filterTime={(time) => filterEndTimes(time, sch.time_start)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right-side fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium">Function</label>
                    <select
                      value={sch.function}
                      onChange={(e) =>
                        updateSchedule(idx, 'function', e.target.value)
                      }
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="">— Select Function —</option>
                      <option value="1">Loading In</option>
                      <option value="2">Show</option>
                      <option value="3">Loading Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium">Setup Name</label>
                    <input
                      type="text"
                      value={sch.setup}
                      onChange={(e) =>
                        updateSchedule(idx, 'setup', e.target.value)
                      }
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">People</label>
                    <input
                      type="number"
                      min="1"
                      value={sch.people}
                      onChange={(e) =>
                        updateSchedule(idx, 'people', e.target.value)
                      }
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addSchedule}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Add Another Schedule
            </button>
            <Button type="submit" disabled={processing}>
              Create All
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}