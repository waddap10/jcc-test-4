import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Megaphone, X } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Venues', href: '/venues' }];

interface Venue {
    id: number;
    name: string;
    photo: string;
    description: string;
    dimension_m: string;
    dimension_f: string;
    setup_banquet: number;
    setup_classroom: number;
    setup_theater: number;
    setup_reception: number;
    floor_plan: string;
}

interface PageProps {
    flash?: { message?: string };
    venues: Venue[];
    [key: string]: unknown;
}

export default function Index() {
    const { venues, flash = { message: undefined } } = usePage<PageProps>().props;

    const { processing, delete: destroyVenue } = useForm<Record<string, never>>();

    const [showAlert, setShowAlert] = useState(true);
    

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete venue "${name}"?`)) {
            destroyVenue(route('venues.destroy', id), {
                preserveScroll: true,
                onSuccess: () => console.log(`Deleted venue ${id}`),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Venues" />

            <div className="m-4 mb-4 inline-flex">
                <Link href={route('venues.create')}>
                    <Button>Create Venue</Button>
                </Link>
            </div>
            <div>
                {flash.message && showAlert && (
                    <div className="fixed inset-x-0 top-4 flex justify-center px-4">
                        <Alert className="relative w-full cursor-pointer sm:w-3/4 md:w-2/3 lg:w-1/2" onClick={() => setShowAlert(false)}>
                            {/* Optional Close Button Instead of Whole-Box Click */}
                            <button
                                type="button"
                                className="absolute top-2 right-2 rounded p-1 hover:bg-gray-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAlert(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <Megaphone className="h-4 w-4" />
                            <AlertTitle>Notification!!!!!!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
            {venues.length > 0 ? (
                <div className="m-4 overflow-auto">
                    <Table>
                        <TableCaption>List of all Venues</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Photo</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Dim (m)</TableHead>
                                <TableHead>Dim (ft)</TableHead>
                                <TableHead>Banquet</TableHead>
                                <TableHead>Classroom</TableHead>
                                <TableHead>Theater</TableHead>
                                <TableHead>Reception</TableHead>
                                <TableHead>Floor Plan</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {venues.map((venue) => (
                                <TableRow key={venue.id}>
                                    <TableCell className="font-medium">{venue.id}</TableCell>
                                    <TableCell>{venue.name}</TableCell>

                                    {/* Photo preview */}
                                    <TableCell>
                                        {venue.photo && (
                                            <img
                                                src={venue.photo.startsWith('http') ? venue.photo : `/storage/${venue.photo}`}
                                                alt={`Photo of ${venue.name}`}
                                                className="h-16 w-auto rounded object-cover"
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell>{venue.description}</TableCell>
                                    <TableCell>{venue.dimension_m}</TableCell>
                                    <TableCell>{venue.dimension_f}</TableCell>
                                    <TableCell>{venue.setup_banquet}</TableCell>
                                    <TableCell>{venue.setup_classroom}</TableCell>
                                    <TableCell>{venue.setup_theater}</TableCell>
                                    <TableCell>{venue.setup_reception}</TableCell>

                                    {/* Floor plan preview */}
                                    <TableCell>
                                        {venue.floor_plan && (
                                            <img
                                                src={venue.floor_plan.startsWith('http') ? venue.floor_plan : `/storage/${venue.floor_plan}`}
                                                alt={`Floor plan of ${venue.name}`}
                                                className="h-16 w-auto rounded object-cover"
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell className="space-x-2 text-center">
                                        <Link href={route('venues.edit', venue.id)}>
                                            <Button className="bg-blue-500 hover:bg-blue-700">Edit</Button>
                                        </Link>
                                        <Button
                                            disabled={processing}
                                            onClick={() => handleDelete(venue.id, venue.name)}
                                            className="bg-red-500 hover:bg-red-700"
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
                <div className="px-4 py-10 text-center text-gray-500">No venue found.</div>
            )}
        </AppLayout>
    );
}