// resources/js/Pages/Orders/Beos/Create.tsx

import React from 'react'
import { Head, useForm, usePage, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Plus, Trash2, Megaphone, Upload, X } from 'lucide-react'
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
  packages: Package[]
}

interface Package {
  id: number
  name: string
}

interface BeoRow {
  department_id: number | null
  package_id:    number | null
  user_id:       number | null
  notes:         string
}

interface PageProps {
  order: { id: number; event_name: string }
  departments: Department[]
  flash?: { message?: string }
  [key: string]: unknown;
}

interface BeoForm {
  entries: BeoRow[]
}

export default function Create() {
  const { order, departments, flash = {} } = usePage<PageProps>().props
  const { data, setData, processing, errors } = useForm<BeoForm>({
    entries: [{ department_id: null, package_id: null, user_id: null, notes: '' }],
  })

  // Separate state for new file attachments
  const [newAttachments, setNewAttachments] = React.useState<Record<number, File[]>>({})

  const updateRow = (idx: number, updates: Partial<BeoRow>) => {
    const newEntries = data.entries.map((row, i) =>
      i === idx ? { ...row, ...updates } : row
    )
    setData('entries', newEntries)
  }

  const addRow = () => {
    setData('entries', [
      ...data.entries,
      { department_id: null, package_id: null, user_id: null, notes: '' },
    ])
  }

  const removeRow = (idx: number) => {
    const filtered = data.entries.filter((_, i) => i !== idx)
    setData('entries', filtered.length ? filtered : [
      { department_id: null, package_id: null, user_id: null, notes: '' },
    ])
    
    // Also remove new attachments for this row
    const newNewAttachments = { ...newAttachments }
    delete newNewAttachments[idx]
    // Re-index remaining attachments
    const reindexed: Record<number, File[]> = {}
    Object.keys(newNewAttachments).forEach((key) => {
      const oldIdx = parseInt(key)
      const newIdx = oldIdx > idx ? oldIdx - 1 : oldIdx
      reindexed[newIdx] = newNewAttachments[oldIdx]
    })
    setNewAttachments(reindexed)
  }

  const handleFileChange = (idx: number, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setNewAttachments(prev => ({
        ...prev,
        [idx]: [...(prev[idx] || []), ...fileArray]
      }))
    }
  }

  const removeNewAttachment = (idx: number, fileIdx: number) => {
    setNewAttachments(prev => ({
      ...prev,
      [idx]: (prev[idx] || []).filter((_, i) => i !== fileIdx)
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Create FormData for file uploads
    const formData = new FormData()
    
    // Add entries data
    data.entries.forEach((entry, index) => {
      formData.append(`entries[${index}][department_id]`, entry.department_id?.toString() || '')
      formData.append(`entries[${index}][package_id]`, entry.package_id?.toString() || '')
      formData.append(`entries[${index}][user_id]`, entry.user_id?.toString() || '')
      formData.append(`entries[${index}][notes]`, entry.notes || '')
    })
    
    // Add new attachments
    Object.keys(newAttachments).forEach((indexStr) => {
      const index = parseInt(indexStr)
      const files = newAttachments[index]
      if (files && files.length > 0) {
        files.forEach((file, fileIndex) => {
          formData.append(`new_attachments[${index}][]`, file)
        })
      }
    })
    
    // Submit using router.post with FormData
    router.post(route('orders.beos.store', order.id), formData, {
      onSuccess: () => {
        router.visit(route('orders.beos.index', order.id))
      },
      onError: (errors) => {
        console.error('Submission errors:', errors)
      }
    })
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Banquet Event Orders', href: route('orders.index') },
    {
      title: `Assignments for ${order.event_name}`,
      href:  route('orders.beos.index', order.id),
    },
    { title: 'Create Assignments', href: '#' },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Assignments" />

      {flash.message && (
        <Alert className="mb-4">
          <Megaphone className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{flash.message}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 px-4 pt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            Create BEO Assignments
          </h2>
          <p className="text-green-700 text-sm">
            Create department assignments for <strong>{order.event_name}</strong>. 
            Add multiple assignments using the "Add New BEO" button below.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-6">
        {data.entries.map((row, idx) => {
          const usersForDept =
            departments.find(d => d.id === row.department_id)?.users ?? []
          const packagesForDept =
            departments.find(d => d.id === row.department_id)?.packages ?? []

          return (
            <div key={idx} className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                    New BEO
                  </span>
                  <span className="text-gray-600">Assignment {idx + 1} of {data.entries.length}</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  className="p-1 text-red-600 hover:text-red-800"
                  onClick={() => removeRow(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-4 items-end">
                {/* Department */}
                <div className="col-span-4">
                  <Label>Department</Label>
                  <select
                    value={row.department_id ?? ''}
                    onChange={e =>
                      updateRow(idx, {
                        department_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                        user_id: null,
                        package_id: null,
                      })
                    }
                    className="mt-1 block w-full border px-2 py-1 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">— Select Department —</option>
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

                {/* Package */}
                <div className="col-span-4">
                  <Label>Package</Label>
                  <select
                    value={row.package_id ?? ''}
                    onChange={e =>
                      updateRow(idx, {
                        package_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    disabled={!row.department_id}
                    className="mt-1 block w-full border px-2 py-1 rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">— Select Package —</option>
                    {packagesForDept.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {!row.department_id && (
                    <p className="text-gray-500 text-xs mt-1">Select a department first</p>
                  )}
                  {errors[`entries.${idx}.package_id`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`entries.${idx}.package_id`]}
                    </p>
                  )}
                </div>

                {/* User */}
                <div className="col-span-4">
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
                    className="mt-1 block w-full border px-2 py-1 rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">— Select Person —</option>
                    {usersForDept.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {!row.department_id && (
                    <p className="text-gray-500 text-xs mt-1">Select a department first</p>
                  )}
                  {errors[`entries.${idx}.user_id`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`entries.${idx}.user_id`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={row.notes}
                  onChange={e =>
                    updateRow(idx, { notes: e.target.value })
                  }
                  placeholder="Add any special notes or instructions..."
                  className="mt-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {errors[`entries.${idx}.notes`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`entries.${idx}.notes`]}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <Label>Attachments</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileChange(idx, e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 focus:outline-none"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  {/* Show selected files */}
                  {newAttachments[idx] && newAttachments[idx].length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-green-700 font-medium">Files to upload:</p>
                      {newAttachments[idx].map((file, fileIdx) => (
                        <div key={fileIdx} className="flex items-center justify-between bg-green-50 p-2 rounded text-sm border border-green-200">
                          <span className="truncate text-green-800 font-medium">📎 {file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => removeNewAttachment(idx, fileIdx)}
                            title="Remove this file"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Row */}
        <div>
          <Button
            type="button"
            variant="outline"
            className="flex items-center space-x-1 border-green-300 text-green-700 hover:bg-green-50"
            onClick={addRow}
          >
            <Plus className="h-4 w-4" />
            <span>Add New BEO</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t bg-gray-50 px-4 py-4 -mx-4">
          <Link
            href={route('orders.beos.index', order.id)}
            className="text-gray-600 hover:text-gray-800 underline font-medium"
          >
            ← Back to BEO List
          </Link>
          <Button 
            type="submit" 
            disabled={processing}
            className="px-6 py-2 bg-green-600 hover:bg-green-700"
          >
            {processing ? 'Creating…' : 'Create All Assignments'}
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}