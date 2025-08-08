import React, { useState, useEffect } from 'react'
import { Head, useForm, router, usePage } from '@inertiajs/react'
import Calendar from 'react-calendar'

import 'react-calendar/dist/Calendar.css'
import { isWithinInterval, parseISO, format } from 'date-fns'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CustomerCombobox } from '@/components/customer-combobox'
import { type BreadcrumbItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MouseEvent as ReactMouseEvent } from 'react'

type Venue = { id: number; name: string }
type Booking = { venue_id: number; start_date: string; end_date: string }
type Customer = { id: number; organizer: string }
type Event = { id: number; event_type: string; code: string }
type CalendarValue = Date | Date[] | null
type CalendarOnChange = (
    value: CalendarValue,
    event: React.MouseEvent<HTMLButtonElement>
) => void

interface Props {
    venues: Venue[]
    bookings: Booking[]
    customers: Customer[]
    events: Event[]
    flash?: { message?: string }
}

type DateRange = { start: string; end: string }

type FormData = {
    venues: number[]
    start_date: string
    end_date: string
    customerOption: 'existing' | 'new'
    existing_customer_id: number | ''
    event_name: string
    event_id: number | ''
    discount: number
    customer: {
        organizer: string
        address: string
        contact_person: string
        phone: string
        email: string
        k_l_status: boolean
    }
}

export default function Create({ venues, bookings, customers, events, flash }: Props) {
    const [step, setStep] = useState(1)
    const [search, setSearch] = useState('')
    const [conflictError, setConflictError] = useState<string | null>(null)

    const { data, setData, post, processing, errors } = useForm<FormData>({
        venues: [],
        start_date: '',
        end_date: '',
        customerOption: 'existing',
        existing_customer_id: '',
        event_name: '',
        event_id: '',
        discount: 0,
        customer: {
            organizer: '',
            address: '',
            contact_person: '',
            phone: '',
            email: '',
            k_l_status: false,
        },
    })

    // build blocked intervals per venue
    const blockedMap = bookings.reduce<Record<number, { start: Date; end: Date }[]>>(
        (acc, b) => {
            const start = parseISO(b.start_date)
            const end = parseISO(b.end_date)
            acc[b.venue_id] = acc[b.venue_id] || []
            acc[b.venue_id].push({ start, end })
            return acc
        },
        {}
    )

    const globalRange: [Date, Date] | null =
        data.start_date && data.end_date
            ? [parseISO(data.start_date), parseISO(data.end_date)]
            : null

    // Flatten every venue's blocked intervals
    const allBlocked = data.venues.flatMap(vid => blockedMap[vid] || [])

    // Handler matches Calendar's two-arg signature
    const handleGlobalRange: CalendarOnChange = (value, _event) => {
        if (!Array.isArray(value) || value.length !== 2) return
        const [s, e] = value as [Date, Date]
        setData('start_date', format(s, 'yyyy-MM-dd'))
        setData('end_date', format(e, 'yyyy-MM-dd'))
    }

    // Check for booking conflicts across selected venues
    function hasBookingConflicts(): { hasConflict: boolean; conflictingVenues: string[] } {
        if (!data.start_date || !data.end_date || !data.venues.length) {
            return { hasConflict: false, conflictingVenues: [] }
        }

        const startDate = parseISO(data.start_date)
        const endDate = parseISO(data.end_date)
        const conflictingVenues: string[] = []

        data.venues.forEach(venueId => {
            const venueBookings = blockedMap[venueId] || []
            const hasConflict = venueBookings.some(booking => {
                // Check if the selected date range overlaps with any existing booking
                return (
                    // New booking starts during existing booking
                    (startDate >= booking.start && startDate <= booking.end) ||
                    // New booking ends during existing booking
                    (endDate >= booking.start && endDate <= booking.end) ||
                    // New booking completely contains existing booking
                    (startDate <= booking.start && endDate >= booking.end)
                )
            })

            if (hasConflict) {
                const venueName = venues.find(v => v.id === venueId)?.name || `Venue ${venueId}`
                conflictingVenues.push(venueName)
            }
        })

        return { hasConflict: conflictingVenues.length > 0, conflictingVenues }
    }

    function next() {
        const { hasConflict, conflictingVenues } = hasBookingConflicts()
        
        if (hasConflict) {
            setConflictError(`The selected date range conflicts with existing bookings for: ${conflictingVenues.join(', ')}`)
            return
        }
        
        setConflictError(null)
        setStep((s) => Math.min(2, s + 1))
    }

    function back() {
        setStep((s) => Math.max(1, s - 1))
    }

    function submit(e: React.FormEvent) {
        e.preventDefault()
        
        // Prepare the payload based on customer option
        const payload: any = {
            venues: data.venues,
            start_date: data.start_date,
            end_date: data.end_date,
            event_name: data.event_name,
            event_id: data.event_id,
            customerOption: data.customerOption
        }
        
        // Only include relevant customer data based on the option
        if (data.customerOption === 'existing') {
            payload.existing_customer_id = data.existing_customer_id
        } else {
            payload.customer = data.customer
        }
        
        // Use router.post instead of the form's post method
        router.post(route('orders.store'), payload, {
            onSuccess: () => router.visit(route('orders.index')),
        })
    }

    const filteredCustomers = customers.filter((c) =>
        c.organizer.toLowerCase().includes(search.toLowerCase())
    )

    // Group events by event_type for better organization
    const groupedEvents = events.reduce<Record<string, Event[]>>((acc, event) => {
        if (!acc[event.event_type]) {
            acc[event.event_type] = []
        }
        acc[event.event_type].push(event)
        return acc
    }, {})

    return (
        <AppLayout breadcrumbs={[{ title: 'Orders', href: '/orders' }, { title: 'Create', href: '' }]}>
            <Head title="Create Order" />

            {flash?.message && (
                <Alert className="mx-6 mt-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{flash.message}</AlertDescription>
                </Alert>
            )}
            <form onSubmit={submit} className="space-y-6 px-6 py-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Step 1: Venues & Dates</h2>

                        <div>
                            <label className="block font-medium mb-2">Select Venues</label>
                            <div className="flex flex-wrap gap-4">
                                {venues.map((v) => (
                                    <label key={v.id} className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={data.venues.includes(v.id)}
                                            onChange={() =>
                                                setData(
                                                    'venues',
                                                    data.venues.includes(v.id)
                                                        ? data.venues.filter((id) => id !== v.id)
                                                        : [...data.venues, v.id]
                                                )
                                            }
                                        />
                                        {v.name}
                                    </label>
                                ))}
                            </div>
                            {errors.venues && <p className="text-red-600">{errors.venues}</p>}
                        </div>
                        {data.venues.length > 0 && (
                            <div
                                className="grid gap-4"
                                style={{
                                    gridTemplateColumns: `repeat(${Math.min(data.venues.length, 4)}, minmax(0,1fr))`
                                }}
                            >
                                {data.venues.map((vid) => {
                                    const blocked = blockedMap[vid] || []

                                    return (
                                        <div key={vid} className="border p-4 rounded">
                                            <p className="mb-2 font-medium">
                                                {venues.find((x) => x.id === vid)?.name}
                                            </p>

                                            <Calendar
                                                selectRange
                                                value={globalRange}
                                                onChange={(value, _event) => {
                                                    setConflictError(null) // Clear error when dates change
                                                    // 'value' here is automatically typed as Calendar's `Value`
                                                    if (!Array.isArray(value) || value.length !== 2) return

                                                    // narrow it down to exactly two real Dates
                                                    const [start, end] = value as [Date, Date]
                                                    if (!(start instanceof Date) || !(end instanceof Date)) return

                                                    setData('start_date', format(start, 'yyyy-MM-dd'))
                                                    setData('end_date', format(end, 'yyyy-MM-dd'))
                                                }}
                                                tileClassName={({ date, view }) => {
                                                    if (view !== 'month') return undefined
                                                    
                                                    const isBlocked = blocked.some(({ start, end }) =>
                                                        isWithinInterval(date, { start, end })
                                                    )
                                                    
                                                    return isBlocked ? 'bg-red-200 text-red-800 cursor-not-allowed' : undefined
                                                }}
                                                tileDisabled={({ date, view }) =>
                                                    view === 'month' &&
                                                    blocked.some(({ start, end }) =>
                                                        isWithinInterval(date, { start, end })
                                                    )
                                                }
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        
                        {conflictError && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTitle className="text-red-800">Booking Conflict</AlertTitle>
                                <AlertDescription className="text-red-700">{conflictError}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex justify-end">
                            <Button
                                onClick={next}
                                disabled={
                                    processing ||
                                    !data.venues.length ||
                                    !data.start_date ||
                                    !data.end_date
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Step 2: Event & Customer</h2>

                        {/* Event Name */}
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="event_name">Event Name</Label>
                            <Input
                                type='text'
                                id="event_name"
                                value={data.event_name}
                                onChange={e => setData('event_name', e.target.value)}
                            />
                            {errors.event_name && (
                                <p className="text-red-600">{errors.event_name}</p>
                            )}
                        </div>

                        {/* Event Type Selection */}
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="event_id">Event Type</Label>
                            <Select
                                value={data.event_id.toString()}
                                onValueChange={(value) => setData('event_id', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(groupedEvents).map(([eventType, eventList]) => (
                                        <div key={eventType}>
                                            {eventList.map((event) => (
                                                <SelectItem key={event.id} value={event.id.toString()}>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span>{event.event_type}</span>
                                                        <span className="text-sm text-gray-500 ml-2">({event.code})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.event_id && (
                                <p className="text-red-600">{errors.event_id}</p>
                            )}
                        </div>
                        <div className="space-y-2 mb-4">
    <Label htmlFor="discount">Discount (%)</Label>
    <Select
        value={data.discount.toString()}
        onValueChange={(value) => setData('discount', parseInt(value))}
    >
        <SelectTrigger>
            <SelectValue placeholder="Select discount percentage" />
        </SelectTrigger>
        <SelectContent>
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((percentage) => (
                <SelectItem key={percentage} value={percentage.toString()}>
                    {percentage}%
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
    {errors.discount && (
        <p className="text-red-600">{errors.discount}</p>
    )}
</div>
                        <div className="flex space-x-4 mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="customerOption"
                                    checked={data.customerOption === 'existing'}
                                    onChange={() => {
                                        setData('customerOption', 'existing')
                                        setData('customer', { 
                                            organizer: '', 
                                            address: '', 
                                            contact_person: '', 
                                            phone: '', 
                                            email: '',
                                            k_l_status: false
                                        })
                                    }}
                                />
                                <span className="ml-2">Use Existing</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="customerOption"
                                    checked={data.customerOption === 'new'}
                                    onChange={() => {
                                        setData('customerOption', 'new')
                                        setData('existing_customer_id', '')
                                    }}
                                />
                                <span className="ml-2">Add New</span>
                            </label>
                        </div>

                        {data.customerOption === 'existing' && (
                            <div className="space-y-2 mb-4">
                                <Label htmlFor="existing_customer_id">Select Organizer</Label>
                                <CustomerCombobox
                                    customers={customers}
                                    value={data.existing_customer_id}
                                    onChange={(id) => setData('existing_customer_id', id)}
                                />
                                {errors.existing_customer_id && (
                                    <p className="text-red-600">{errors.existing_customer_id}</p>
                                )}
                            </div>
                        )}

                        {/* new customer inputs */}
                        {data.customerOption === 'new' && (
                            <div className="space-y-4 mb-4">
                                {(['organizer', 'address', 'contact_person', 'phone', 'email'] as const).map((field) => (
                                    <div key={field}>
                                        <Label htmlFor={field}>
                                            {field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Label>
                                        <Input
                                            id={field}
                                            value={data.customer[field]}
                                            onChange={(e) =>
                                                setData((cur) => ({
                                                    ...cur,
                                                    customer: { ...cur.customer, [field]: e.target.value },
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                                
                                {/* K/L Status Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="k_l_status">K/L Status</Label>
                                    <div className="flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="k_l_status"
                                                checked={data.customer.k_l_status === true}
                                                onChange={() =>
                                                    setData((cur) => ({
                                                        ...cur,
                                                        customer: { ...cur.customer, k_l_status: true },
                                                    }))
                                                }
                                                className="mr-2"
                                            />
                                            <span className="text-green-600 font-medium">Yes</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="k_l_status"
                                                checked={data.customer.k_l_status === false}
                                                onChange={() =>
                                                    setData((cur) => ({
                                                        ...cur,
                                                        customer: { ...cur.customer, k_l_status: false },
                                                    }))
                                                }
                                                className="mr-2"
                                            />
                                            <span className="text-red-600 font-medium">No</span>
                                        </label>
                                    </div>
                                    {errors['customer.k_l_status'] && (
                                        <p className="text-red-600">{errors['customer.k_l_status']}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button variant="secondary" onClick={back}>
                                Back
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Order
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </AppLayout>
    )
}