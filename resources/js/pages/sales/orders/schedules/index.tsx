import React from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { parseISO, parse, format } from 'date-fns'

interface Venue {
  id: number
  name: string
}

interface Schedule {
  id: number
  start_date: string   // ISO date e.g. "2025-07-23"
  end_date: string     // ISO date e.g. "2025-07-23"
  time_start: string   // "HH:mm:ss"
  time_end: string     // "HH:mm:ss"
  venue: Venue
  function: number     // 1, 2, or 3
  setup: string
  people: number
}


interface Order {
  id: number
  event_name: string
  schedules: Schedule[]
  start_date: string
  end_date: string
}

interface PageProps {
  order: Order
  flash: { message?: string }
  [key: string]: any
}

export default function Index() {
  const { order, flash } = usePage<PageProps>().props
  const { delete: destroy, processing } = useForm()

  // Map numeric enum to label
  const functionLabels: Record<number, string> = {
    1: 'Loading In',
    2: 'Show',
    3: 'Loading Out',
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/orders' },
    {
      title: `Schedules for ${order.event_name}`,
      href: route('orders.schedules.index', order.id),
    },
  ]

  function handleDelete(s: Schedule) {
    if (confirm(`Delete schedule #${s.id}?`)) {
      destroy(route('orders.schedules.destroy', [order.id, s.id]), {
        preserveScroll: true,
      })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Schedules of ${order.event_name}`} />

      <div className="space-y-6 px-6 py-4">
        {flash?.message && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{flash.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Schedules for “{order.event_name}”
          </h1>
          <Link href={route('orders.schedules.create', order.id)}>
            <Button size="sm">+ New Schedule</Button>
          </Link>
        </div>

        <div>
          {format(parseISO(order.start_date), 'dd/MM/yy')}
          {' – '}
          {format(parseISO(order.end_date), 'dd/MM/yy')}
        </div>

        <Table>
          {order.schedules.length > 0 && (
            <TableCaption>All schedules for this order</TableCaption>
          )}

          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time Range</TableHead>
              <TableHead>Function</TableHead>
              <TableHead>Setup</TableHead>
              <TableHead className="text-right">People</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {order.schedules.length > 0 ? (
              order.schedules.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50">
                  {/* date ddMMyy */}
                  <TableCell>
                    {(() => {
                      const start = parseISO(s.start_date)
                      const end = parseISO(s.end_date)

                      // if same day, show one date; otherwise show a range
                      return start.getTime() === end.getTime()
                        ? format(start, 'dd/MM/yy')
                        : `${format(start, 'dd/MM/yy')} – ${format(end, 'dd/MM/yy')}`
                    })()}
                  </TableCell>

                  {/* time HH:mm – HH:mm */}
                  <TableCell>
                    {format(
                      parse(s.time_start, 'HH:mm:ss', new Date()),
                      'HH:mm'
                    )}{' '}
                    –{' '}
                    {format(
                      parse(s.time_end, 'HH:mm:ss', new Date()),
                      'HH:mm'
                    )}
                  </TableCell>

                  

                  {/* map enum to label */}
                  <TableCell>
                    {functionLabels[s.function] ?? 'Unknown'}
                  </TableCell>

                  <TableCell>{s.setup || '—'}</TableCell>

                  <TableCell className="text-right">
                    {s.people}
                  </TableCell>

                  <TableCell className="text-center space-x-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(s)}
                      disabled={processing}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500"
                >
                  No schedules added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  )
}