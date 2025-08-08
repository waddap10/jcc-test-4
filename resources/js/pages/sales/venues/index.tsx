import React from 'react';
import { Head, Link } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { Eye, MapPin, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Venue {
  id: number;
  name: string;
  short: string;
  photo: string | null;
  dimension_m: number;
  dimension_f: number;
  setup_banquet: number;
  setup_classroom: number;
  setup_theater: number;
  setup_reception: number;
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

const VenuesIndex: React.FC<Props> = ({ venues }) => {
  const formatDimensions = (dimensionM: number, dimensionF: number) => {
    if (!dimensionM && !dimensionF) return 'N/A';
    return `${dimensionM || 0}m × ${dimensionF || 0}ft`;
  };

  const getMaxCapacity = (venue: Venue) => {
    const capacities = [
      venue.setup_banquet,
      venue.setup_classroom, 
      venue.setup_theater,
      venue.setup_reception
    ];
    return Math.max(...capacities.filter(c => c > 0), 0);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Available Venues
          </h2>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Read Only
          </Badge>
        </div>
      }
    >
      <Head title="Venues - Browse" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Venue Directory
              </CardTitle>
              <CardDescription>
                Browse available venues and their specifications for event planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {venues.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No venues available
                  </h3>
                  <p className="text-gray-500">
                    There are currently no venues in the system.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Max Capacity</TableHead>
                        <TableHead>Setup Options</TableHead>
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
                            <div>
                              <div className="font-medium">{venue.name}</div>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {venue.short}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDimensions(venue.dimension_m, venue.dimension_f)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{getMaxCapacity(venue)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {venue.setup_banquet > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Banquet ({venue.setup_banquet})
                                </Badge>
                              )}
                              {venue.setup_classroom > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Classroom ({venue.setup_classroom})
                                </Badge>
                              )}
                              {venue.setup_theater > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Theater ({venue.setup_theater})
                                </Badge>
                              )}
                              {venue.setup_reception > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Reception ({venue.setup_reception})
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={route('venues.show', venue.id)}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
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