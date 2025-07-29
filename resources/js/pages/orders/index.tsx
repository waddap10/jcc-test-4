import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Orders', href: '/orders' }];

interface Venue {
    id: number;
    name: string;
}

interface Customer {
    organizer: string;
}

interface Order {
    id: number;
    event_name: string;
    customer?: Customer;
    start_date?: string;
    end_date?: string;
    status: number;
    status_beo: number;
    venues?: Venue[];
}

interface PageProps {
    orders: Order[];
    flash?: { message?: string };
    [key: string]: unknown;
}

export default function Index() {
    const { orders, flash } = usePage().props as unknown as PageProps;
    const { processing, delete: destroy, patch } = useForm();

    const handleDelete = (o: Order) => {
        if (confirm(`Delete #${o.id}: ${o.event_name}?`)) {
            destroy(route('orders.destroy', o.id));
        }
    };

    const handleConfirm = (o: Order) => {
        if (confirm(`Konfirmasi pesanan #${o.id} ?`)) {
            patch(route('orders.status.update', o.id));
        }
    };

    const handleAccKanit = (o: Order) => {
      if (confirm(`Acc Kanit for #${o.id}?`)) {
            patch(route('orders.acc-kanit', o.id));
        }
    };

    const handleSelesai = (o: Order) => {
        if (confirm(`Mark order #${o.id} as completed?`)) {
            patch(route('orders.selesai', o.id));
        }
    };

    const formatRange = (start?: string, end?: string) => {
        if (!start && !end) return '—';
        const s = start ? new Date(start).toLocaleDateString() : '—';
        const e = end ? new Date(end).toLocaleDateString() : '—';
        return `${s} – ${e}`;
    };

    // Map status codes to label + background color
    const getStatusProps = (status: number) => {
        switch (status) {
            case 0:
                return { label: 'New Inquiry', bgcolor: '#A5D6A7' }; // light green
            case 1:
                return { label: 'Sudah Konfirmasi', bgcolor: '#FFF59D' }; // light yellow
            case 2:
                return { label: 'Sudah dilaksanakan', bgcolor: '#90CAF9' }; // light blue
            default:
                return { label: 'Unknown', bgcolor: '#E0E0E0' }; // gray
        }
    };

    const getStatusBeoProps = (status_beo: number) => {
        switch (status_beo) {
            case 0:
                return { label: 'Planning', bgcolor: '#A5D6A7' }; // light green
            case 1:
                return { label: 'Sudah Kirim Ke Kanit', bgcolor: '#FFF59D' }; // light yellow
            case 2:
                return { label: 'Sudah Acc Kanit', bgcolor: '#90CAF9' }; // light blue
            default:
                return { label: 'Unknown', bgcolor: '#E0E0E0' }; // gray
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="space-y-6 px-6 py-4">
                {flash?.message && (
                    <Alert className="mb-4">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Orders</h1>
                    <Link href={route('orders.create')}>
                        <Button>Add New</Button>
                    </Link>
                </div>

                <Table>
                    <TableCaption>List of all orders</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Event Name</TableHead>
                            <TableHead>Organizer</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Venues</TableHead>
                            <TableHead>Status Order</TableHead>
                            <TableHead>Status BEO</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((o) => {
                            const status = getStatusProps(o.status);
                            const status_beo = getStatusBeoProps(o.status_beo);
                            const range = formatRange(o.start_date, o.end_date);

                            return (
                                <TableRow key={o.id}>
                                    <TableCell>{o.id}</TableCell>
                                    <TableCell>{o.event_name}</TableCell>
                                    <TableCell>{o.customer?.organizer ?? '—'}</TableCell>
                                    <TableCell>{range}</TableCell>

                                    <TableCell>
                                        {o.venues && o.venues.length ? (
                                            <ul className="list-inside list-disc pl-4">
                                                {o.venues.map((v) => (
                                                    <li key={v.id}>{v.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded px-2 py-1 text-sm" style={{ backgroundColor: status.bgcolor }}>
                                            {status.label}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded px-2 py-1 text-sm" style={{ backgroundColor: status_beo.bgcolor }}>
                                            {status_beo.label}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex grid items-center gap-2">
                                            {o.status === 0 ? (
                                                /* only Konfirmasi */
                                                <Button
                                                    onClick={() => handleConfirm(o)}
                                                    className="rounded bg-yellow-200 px-3 py-1 text-sm font-medium text-yellow-800 hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                                >
                                                    Konfirmasi
                                                </Button>
                                            ) : (
                                                /* Schedule, Beo, Acc Kanit */
                                                <>
                                                    {/* Schedule — green */}
                                                    <Button
                                                        asChild
                                                        variant="default"
                                                        size="sm"
                                                        className="rounded bg-green-200 px-3 py-1 text-sm font-medium text-green-800 hover:bg-green-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                    >
                                                        <Link href={route('orders.schedules.index', o.id)}>Schedule</Link>
                                                    </Button>

                                                    {/* Beo — black & white */}
                                                    <Button
                                                        asChild
                                                        variant="default"
                                                        size="sm"
                                                        className="rounded border border-black bg-black px-3 py-1 text-sm font-medium text-white hover:bg-white hover:text-black focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none"
                                                    >
                                                        <Link href={route('orders.beos.index', o.id)}>Beo</Link>
                                                    </Button>

                                                    {/* Acc Kanit — purple */}
                                                    <Button
                                                        onClick={() => handleAccKanit(o)}
                                                        className="rounded bg-purple-200 px-3 py-1 text-sm font-medium text-purple-800 hover:bg-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                                    >
                                                        Acc Kanit
                                                    </Button>
                                                </>
                                            )}

                                            {/* Selesai — only show when status_beo = 2 and status != 2 */}
                                            {o.status_beo === 2 && o.status !== 2 && (
                                                <Button
                                                    onClick={() => handleSelesai(o)}
                                                    className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                >
                                                    Selesai
                                                </Button>
                                            )}

                                            {/* Delete — always here */}
                                            <Button
                                                onClick={() => handleDelete(o)}
                                                className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}