import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Venue {
  id: number;
  name: string;
  short: string;
  photo: string | null;
  dimension_m: number;
  dimension_f: number;
  created_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedVenues {
  data: Venue[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface Props {
  venues: PaginatedVenues;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const VenuesIndex: React.FC<Props> = ({ venues, canCreate, canEdit, canDelete }) => {
  const handleDelete = (venue: Venue) => {
    router.delete(route('admin.venues.destroy', venue.id), {
      onSuccess: () => {
        // Success message will be handled by flash messages
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDimensions = (dimensionM: number, dimensionF: number) => {
    if (!dimensionM && !dimensionF) return 'N/A';
    return `${dimensionM || 0}m × ${dimensionF || 0}ft`;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Venue Management
          </h2>
          {canCreate && (
            <Link href={route('admin.venues.create')}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Venue
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <Head title="Venues - Admin" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Venues
              </CardTitle>
              <CardDescription>
                Manage venue locations and their specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {venues.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No venues found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first venue.
                  </p>
                  {canCreate && (
                    <Link href={route('admin.venues.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Venue
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Short Code</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venues.data.map((venue) => (
                        <TableRow key={venue.id}>
                          <TableCell>
                            {venue.photo ? (
                              <img
                                src={venue.photo}
                                alt={venue.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{venue.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{venue.short}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatDimensions(venue.dimension_m, venue.dimension_f)}
                          </TableCell>
                          <TableCell>{formatDate(venue.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={route('admin.venues.show', venue.id)}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {canEdit && (
                                <Link href={route('admin.venues.edit', venue.id)}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{venue.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(venue)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {venues.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        Showing {venues.data.length} of {venues.total} venues
                      </div>
                      <div className="flex gap-2">
                        {venues.links.map((link, index) => {
                          if (!link.url) {
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                disabled
                                dangerouslySetInnerHTML={{ __html: link.label }}
                              />
                            );
                          }

                          return (
                            <Link key={index} href={link.url}>
                              <Button
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default VenuesIndex;