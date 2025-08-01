import React, { useState } from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Megaphone, X } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

interface Customer {
  id: number
  organizer: string
  address: string
  contact_person: string
  phone: string
  email: string
  orders_count: number
  created_at: string
}

interface PageProps {
  flash: {
    message?: string
    error?: string
  }
  customers: Customer[]
}

export default function CustomerIndex() {
  const { customers, flash } = usePage().props as unknown as PageProps
  const [showAlert, setShowAlert] = useState(true)
  const [showErrorAlert, setShowErrorAlert] = useState(true)

  const { processing, delete: destroy } = useForm()

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Customers',
      href: '/customers',
    },
  ]

  const handleDelete = (customer: Customer) => {
    if (customer.orders_count > 0) {
      alert('Cannot delete customer with existing orders.')
      return
    }

    if (confirm(`Are you sure you want to delete customer - ${customer.id}. ${customer.organizer}?`)) {
      destroy(route('customers.destroy', customer.id))
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Customers" />
      
      <div className="m-4 mb-4 inline-flex items-center">
        <Link href={route('customers.create')}>
          <Button>Create Customer</Button>
        </Link>
      </div>

      <div>
        {flash.message && showAlert && (
          <div className="fixed inset-x-0 top-4 flex justify-center px-4 z-50">
            <Alert className="relative w-full cursor-pointer sm:w-3/4 md:w-2/3 lg:w-1/2" onClick={() => setShowAlert(false)}>
              <button
                type="button"
                className="absolute top-2 right-2 rounded p-1 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAlert(false)
                }}
              >
                <X className="h-4 w-4" />
              </button>
              <Megaphone className="h-4 w-4" />
              <AlertTitle>Notification!</AlertTitle>
              <AlertDescription>{flash.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {flash.error && showErrorAlert && (
          <div className="fixed inset-x-0 top-4 flex justify-center px-4 z-50">
            <Alert className="relative w-full cursor-pointer sm:w-3/4 md:w-2/3 lg:w-1/2 border-red-200 bg-red-50" onClick={() => setShowErrorAlert(false)}>
              <button
                type="button"
                className="absolute top-2 right-2 rounded p-1 hover:bg-red-200"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowErrorAlert(false)
                }}
              >
                <X className="h-4 w-4" />
              </button>
              <Megaphone className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error!</AlertTitle>
              <AlertDescription className="text-red-700">{flash.error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {customers.length > 0 ? (
        <div className="m-4">
          <Table>
            <TableCaption>List of all Customers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Number</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>{customer.organizer}</TableCell>
                  <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                  <TableCell>{customer.contact_person}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {customer.orders_count}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2 text-center">
                    <Link href={route('customers.edit', customer.id)}>
                      <Button className="bg-blue-500 hover:bg-blue-700">Edit</Button>
                    </Link>
                    <Button
                      disabled={processing || customer.orders_count > 0}
                      onClick={() => handleDelete(customer)}
                      className={`bg-red-500 hover:bg-red-700 ${customer.orders_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="px-4 py-10 text-center text-gray-500">No customers found.</div>
      )}
    </AppLayout>
  )
}