import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Ruler, 
  Users, 
  FileImage,
  Download,
  Calendar
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Venue {
  id: number;
  name: string;
  short: string;
  photo: string | null;
  description: string | null;
  dimension_m: number;
  dimension_f: number;
  setup_banquet: number;
  setup_classroom: number;
  setup_theater: number;
  setup_reception: number;
  floor_plan: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  venue: Venue;
  canEdit: boolean;
  canDelete: boolean;
}

const VenuesShow: React.FC<Props> = ({ venue, canEdit, canDelete }) => {
  const handleDelete = () => {
    router.delete(route('admin.venues.destroy', venue.id), {
      onSuccess: () => {
        router.visit(route('admin.venues.index'));
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDimensions = (dimensionM: number, dimensionF: number) => {
    if (!dimensionM && !dimensionF) return 'Not specified';
    return `${dimensionM || 0} meters × ${dimensionF || 0} feet`;
  };

  const setupConfigs = [
    { label: 'Banquet', value: venue.setup_banquet, icon: Users },
    { label: 'Classroom', value: venue.setup_classroom, icon: Users },
    { label: 'Theater', value: venue.setup_theater, icon: Users },
    { label: 'Reception', value: venue.setup_reception, icon: Users },
  ];

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.venues.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold leading-tight text-gray-800">
                {venue.name}
              </h2>
              <p className="text-sm text-gray-600">Venue Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link href={route('admin.venues.edit', venue.id)}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      }
    >
      <Head title={`${venue.name} - Venue Details`} />

      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {venue.name}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mt-2">
                      {venue.short}
                    </Badge>
                  </CardDescription>
                </div>
                {venue.photo && (
                  <div className="flex-shrink-0">
                    <img
                      src={venue.photo}
                      alt={venue.name}
                      className="h-24 w-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {venue.description && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{venue.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-gray-900">
                {formatDimensions(venue.dimension_m, venue.dimension_f)}
              </div>
              {(venue.dimension_m || venue.dimension_f) && (
                <div className="mt-2 text-sm text-gray-600">
                  <div>Length: {venue.dimension_m || 0} meters</div>
                  <div>Width: {venue.dimension_f || 0} feet</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Capacities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Setup Capacities
              </CardTitle>
              <CardDescription>
                Maximum capacity for different seating arrangements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {setupConfigs.map((config) => (
                  <div key={config.label} className="text-center p-4 border rounded-lg">
                    <config.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {config.value || 0}
                    </div>
                    <div className="text-sm text-gray-600">{config.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Floor Plan */}
          {venue.floor_plan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {venue.floor_plan.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <FileImage className="h-12 w-12 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">Floor Plan PDF</p>
                        <p className="text-sm text-gray-600">Click to download the floor plan</p>
                      </div>
                      <a href={venue.floor_plan} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <img
                        src={venue.floor_plan}
                        alt="Floor Plan"
                        className="max-w-full h-auto rounded-lg border"
                      />
                      <div className="flex justify-end">
                        <a href={venue.floor_plan} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-gray-600">{formatDate(venue.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Last Updated</h4>
                  <p className="text-gray-600">{formatDate(venue.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default VenuesShow;