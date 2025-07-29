// resources/js/Pages/Orders/Calendar.tsx

import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { addMonths, subMonths, format } from 'date-fns'
import AppLayout from '@/layouts/app-layout'
import {
  Table, TableCaption, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { route } from 'ziggy-js'
import { type BreadcrumbItem } from '@/types'

interface Venue {
  id: number
  name: string
}

interface Slot {
  order_id: number
  event_name: string
  start: string
  end: string
  status: number      // 0, 1 or 2
}


interface VenueSchedule {
  name: string
  slots: Slot[]
}

interface Props {
  venues: Venue[]
  calendarData: Record<number, VenueSchedule>
  month: number
  year: number
}

export default function Calendar({
  venues, calendarData, month, year,
}: Props) {
  const current = new Date(year, month - 1, 1)
  const prev = subMonths(current, 1)
  const next = addMonths(current, 1)

  // Build a list of every day in the month
  const daysInMonth = new Date(year, month, 0).getDate()
  const rows = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month - 1, i + 1)
    const iso = d.toISOString().slice(0, 10)  // "YYYY-MM-DD"
    return { dateObj: d, iso }
  })

  return (
    <AppLayout breadcrumbs={[
      { title: 'Calendar', href: '/orders/calendar' },
    ]}>
      <Head title="Venue Booking Calendar" />

      <div className="flex flex-col h-screen">
        {/* Fixed Month navigation */}
        <div className="flex items-center justify-between px-4 py-6 bg-white border-b border-gray-200 sticky top-0 z-20">
          <Link
            href={route('orders.calendar', {
              month: prev.getMonth() + 1, year: prev.getFullYear(),
            })}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← {format(prev, 'MMM yyyy')}
          </Link>

          <h1 className="text-2xl font-semibold">
            {format(current, 'MMMM yyyy')}
          </h1>

          <Link
            href={route('orders.calendar', {
              month: next.getMonth() + 1, year: next.getFullYear(),
            })}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {format(next, 'MMM yyyy')} →
          </Link>
        </div>

        {/* Scrollable table container */}
        <div className="flex-1 overflow-auto px-4 pb-6">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableCaption>
                Availability for {format(current, 'MMMM yyyy')}
              </TableCaption>

              <TableHeader className="sticky top-0 z-10">
                <TableRow className="divide-x divide-gray-200">
                  <TableHead className="w-32 sticky left-0 bg-white z-20 border-r border-gray-200">
                    Date
                  </TableHead>
                  {venues.map(v => (
                    <TableHead key={v.id} className="text-center min-w-32 bg-white">
                      {v.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map(({ dateObj, iso }) => (
                  <TableRow key={iso} className="divide-x divide-gray-200">

                    <TableCell className="font-medium sticky left-0 bg-white z-10 border-r border-gray-200">
                      {format(dateObj, 'd')}
                    </TableCell>

                    {(() => {
                      const cells: React.ReactNode[] = []
                      let i = 0

                      // prefilter slots per venue
                      const scheduleMap = venues.reduce<Record<number, Slot[]>>((acc, v) => {
                        acc[v.id] = calendarData[v.id]?.slots.filter(s =>
                          s.start.slice(0, 10) <= iso && s.end.slice(0, 10) >= iso
                        ) ?? []
                        return acc
                      }, {})

                      // walk through venues, merging adjacent same-order cells
                      while (i < venues.length) {
                        const vid = venues[i].id
                        const hits = scheduleMap[vid]

                        if (!hits.length) {
                          cells.push(
                            <TableCell key={vid} className="text-gray-400 min-w-32"></TableCell>
                          )
                          i++
                          continue
                        }

                        // find how many in a row share this order_id
                        const eventId = hits[0].order_id
                        let span = 1
                        while (
                          i + span < venues.length &&
                          scheduleMap[venues[i + span].id].some(s => s.order_id === eventId)
                        ) span++

                        // pick badge color by status
                        const st = Number(hits[0].status)
                        const bg = st === 0
                          ? 'bg-green-100'
                          : st === 1
                            ? 'bg-yellow-100'
                            : 'bg-blue-100'

                        cells.push(
                          <TableCell
                            key={vid}
                            colSpan={span}
                            className={`p-1 text-center min-w-32 ${bg}`}
                          >
                            <div className="text-xs">
                              {hits[0].event_name}
                            </div>
                          </TableCell>
                        )

                        i += span
                      }

                      return cells
                    })()}

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}