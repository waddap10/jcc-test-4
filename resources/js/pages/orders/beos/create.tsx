// resources/js/Pages/Orders/Beos/Create.tsx

import React from 'react'
import { Head, useForm, usePage, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Plus, Trash2, Megaphone } from 'lucide-react'
import {route} from 'ziggy-js'
import { type BreadcrumbItem } from '@/types'

interface User {
  id: number
  name: string
}

interface Department {
  id: number
  name: string
  users: User[]
}

interface BeoRow {
  department_id: number | null
  user_id:       number | null
  description:   string
}

interface PageProps {
  order: { id: number; event_name: string }
  departments: Department[]
  flash?: { message?: string }
  [key: string]: unknown;
}

interface BeoForm extends Record<string, any> {
  entries: BeoRow[]
}

export default function Create() {
  const { order, departments, flash = {} } = usePage<PageProps>().props
  const { data, setData, post, processing, errors } = useForm<BeoForm>({
    entries: [{ department_id: null, user_id: null, description: '' }],
  })

  const updateRow = (idx: number, updates: Partial<BeoRow>) => {
    const newEntries = data.entries.map((row, i) =>
      i === idx ? { ...row, ...updates } : row
    )
    setData('entries', newEntries)
  }

  const addRow = () => {
    setData('entries', [
      ...data.entries,
      { department_id: null, user_id: null, description: '' },
    ])
  }

  const removeRow = (idx: number) => {
    const filtered = data.entries.filter((_, i) => i !== idx)
    setData('entries', filtered.length ? filtered : [
      { department_id: null, user_id: null, description: '' },
    ])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(route('orders.beos.store', order.id))
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Banquet Event Orders', href: route('orders.index') },
    {
      title: `Assignments for ${order.event_name}`,
      href:  route('orders.beos.index', order.id),
    },
    { title: 'New Assignments', href: '#' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="New Assignments" />

      {flash.message && (
        <Alert className="mb-4">
          <Megaphone className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{flash.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 px-4 py-6">
        {data.entries.map((row, idx) => {
          const usersForDept =
            departments.find(d => d.id === row.department_id)?.users ?? []

          return (
            <div key={idx} className="grid grid-cols-12 gap-4 items-end">
              {/* Department */}
              <div className="col-span-3">
                <Label>Department</Label>
                <select
                  value={row.department_id ?? ''}
                  onChange={e =>
                    updateRow(idx, {
                      department_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                      user_id: null,
                    })
                  }
                  className="mt-1 block w-full border px-2 py-1"
                >
                  <option value="">— Select —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors[`entries.${idx}.department_id`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`entries.${idx}.department_id`]}
                  </p>
                )}
              </div>

              {/* User */}
              <div className="col-span-3">
                <Label>Person In Charge</Label>
                <select
                  value={row.user_id ?? ''}
                  onChange={e =>
                    updateRow(idx, {
                      user_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  disabled={!row.department_id}
                  className="mt-1 block w-full border px-2 py-1 bg-white disabled:opacity-50"
                >
                  <option value="">— Select —</option>
                  {usersForDept.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                {errors[`entries.${idx}.user_id`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`entries.${idx}.user_id`]}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-5">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={row.description}
                  onChange={e =>
                    updateRow(idx, { description: e.target.value })
                  }
                />
                {errors[`entries.${idx}.description`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`entries.${idx}.description`]}
                  </p>
                )}
              </div>

              {/* Remove */}
              <div className="col-span-1 text-right">
                <Button
                  type="button"
                  variant="outline"
                  className="p-1 text-red-600 hover:text-red-800"
                  onClick={() => removeRow(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}

        {/* Add Row */}
        <div>
          <Button
            type="button"
            variant="outline"
            className="flex items-center space-x-1"
            onClick={addRow}
          >
            <Plus className="h-4 w-4" />
            <span>Add Row</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Link
            href={route('orders.beos.index', order.id)}
            className="text-gray-600 hover:underline"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={processing}>
            {processing ? 'Saving…' : 'Save Assignments'}
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}