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


interface Venue {
  id: number
  name: string
}

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
  venue_id: string
  function: string
  setup: string
  people: string
}

export default function Create() {
  const { order, venues, flash = {}, errors = {} } = usePage<{
    order: Order
    venues: Venue[]
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
        venue_id: '',
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
    const next = data.schedules.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    )
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

  // Add / Remove schedule rows
  const addSchedule = () => {
    setData('schedules', [
      ...data.schedules,
      {
        start_date: '',
        end_date: '',
        time_start: '',
        time_end: '',
        venue_id: '',
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
          Add Schedule(s) to “{order.event_name}”
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
                  minDate={subDays(parseISO(order.start_date), 1)}
                  maxDate={addDays(parseISO(order.end_date), 1)}
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
                          if (date) {
                            updateSchedule(
                              idx,
                              'time_start',
                              format(date, 'HH:mm')
                            )
                          }
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="HH:mm"
                        className="w-full rounded border px-3 py-2"
                        placeholderText="Select start…"
                      />
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
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium">Venue</label>
                    <select
                      value={sch.venue_id}
                      onChange={(e) =>
                        updateSchedule(idx, 'venue_id', e.target.value)
                      }
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="">— Choose venue —</option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
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