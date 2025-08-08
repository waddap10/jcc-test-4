import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Upload, MapPin, X } from 'lucide-react';
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
}

interface FormData {
  name: string;
  short: string;
  photo: File | null;
  description: string;
  dimension_m: string;
  dimension_f: string;
  setup_banquet: string;
  setup_classroom: string;
  setup_theater: string;
  setup_reception: string;
  floor_plan: File | null;
  _method: string;
}

interface Props {
  venue: Venue;
}

const VenuesEdit: React.FC<Props> = ({ venue }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(venue.photo);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(venue.floor_plan);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeFloorPlan, setRemoveFloorPlan] = useState(false);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: venue.name,
    short: venue.short,
    photo: null,
    description: venue.description || '',
    dimension_m: venue.dimension_m?.toString() || '',
    dimension_f: venue.dimension_f?.toString() || '',
    setup_banquet: venue.setup_banquet?.toString() || '',
    setup_classroom: venue.setup_classroom?.toString() || '',
    setup_theater: venue.setup_theater?.toString() || '',
    setup_reception: venue.setup_reception?.toString() || '',
    floor_plan: null,
    _method: 'PATCH',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.venues.update', venue.id));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('photo', file);
      setRemovePhoto(false);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFloorPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('floor_plan', file);
      setRemoveFloorPlan(false);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFloorPlanPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFloorPlanPreview(null);
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setRemovePhoto(true);
    setData('photo', null);
  };

  const handleRemoveFloorPlan = () => {
    setFloorPlanPreview(null);
    setRemoveFloorPlan(true);
    setData('floor_plan', null);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.venues.show', venue.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
              Edit Venue
            </h2>
            <p className="text-sm text-gray-600">{venue.name}</p>
          </div>
        </div>
      }
    >
      <Head title={`Edit ${venue.name} - Admin`} />

      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update the basic details for this venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Enter venue name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short">Short Code *</Label>
                    <Input
                      id="short"
                      type="text"
                      value={data.short}
                      onChange={(e) => setData('short', e.target.value)}
                      placeholder="e.g., MAIN, CONF1"
                      className={errors.short ? 'border-red-500' : ''}
                    />
                    {errors.short && <p className="text-sm text-red-500">{errors.short}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe the venue features and amenities"
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensions</CardTitle>
                <CardDescription>
                  Update the venue dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dimension_m">Length (meters)</Label>
                    <Input
                      id="dimension_m"
                      type="number"
                      step="0.1"
                      min="0"
                      value={data.dimension_m}
                      onChange={(e) => setData('dimension_m', e.target.value)}
                      placeholder="0.0"
                      className={errors.dimension_m ? 'border-red-500' : ''}
                    />
                    {errors.dimension_m && <p className="text-sm text-red-500">{errors.dimension_m}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimension_f">Width (feet)</Label>
                    <Input
                      id="dimension_f"
                      type="number"
                      step="0.1"
                      min="0"
                      value={data.dimension_f}
                      onChange={(e) => setData('dimension_f', e.target.value)}
                      placeholder="0.0"
                      className={errors.dimension_f ? 'border-red-500' : ''}
                    />
                    {errors.dimension_f && <p className="text-sm text-red-500">{errors.dimension_f}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Capacities */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Capacities</CardTitle>
                <CardDescription>
                  Maximum capacity for different seating arrangements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="setup_banquet">Banquet Style</Label>
                    <Input
                      id="setup_banquet"
                      type="number"
                      min="0"
                      value={data.setup_banquet}
                      onChange={(e) => setData('setup_banquet', e.target.value)}
                      placeholder="0"
                      className={errors.setup_banquet ? 'border-red-500' : ''}
                    />
                    {errors.setup_banquet && <p className="text-sm text-red-500">{errors.setup_banquet}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup_classroom">Classroom Style</Label>
                    <Input
                      id="setup_classroom"
                      type="number"
                      min="0"
                      value={data.setup_classroom}
                      onChange={(e) => setData('setup_classroom', e.target.value)}
                      placeholder="0"
                      className={errors.setup_classroom ? 'border-red-500' : ''}
                    />
                    {errors.setup_classroom && <p className="text-sm text-red-500">{errors.setup_classroom}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup_theater">Theater Style</Label>
                    <Input
                      id="setup_theater"
                      type="number"
                      min="0"
                      value={data.setup_theater}
                      onChange={(e) => setData('setup_theater', e.target.value)}
                      placeholder="0"
                      className={errors.setup_theater ? 'border-red-500' : ''}
                    />
                    {errors.setup_theater && <p className="text-sm text-red-500">{errors.setup_theater}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup_reception">Reception Style</Label>
                    <Input
                      id="setup_reception"
                      type="number"
                      min="0"
                      value={data.setup_reception}
                      onChange={(e) => setData('setup_reception', e.target.value)}
                      placeholder="0"
                      className={errors.setup_reception ? 'border-red-500' : ''}
                    />
                    {errors.setup_reception && <p className="text-sm text-red-500">{errors.setup_reception}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Files */}
            <Card>
              <CardHeader>
                <CardTitle>Media Files</CardTitle>
                <CardDescription>
                  Update venue photo and floor plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Venue Photo</Label>
                  <div className="space-y-4">
                    {photoPreview && !removePhoto && (
                      <div className="relative inline-block">
                        <img src={photoPreview} alt="Current photo" className="h-32 w-32 object-cover rounded-lg border" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className={errors.photo ? 'border-red-500' : ''}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                    </div>
                    {errors.photo && <p className="text-sm text-red-500">{errors.photo}</p>}
                  </div>
                </div>

                {/* Floor Plan Upload */}
                <div className="space-y-2">
                  <Label htmlFor="floor_plan">Floor Plan</Label>
                  <div className="space-y-4">
                    {floorPlanPreview && !removeFloorPlan && (
                      <div className="relative inline-block">
                        {floorPlanPreview.toLowerCase().includes('.pdf') ? (
                          <div className="flex items-center gap-2 p-4 border rounded-lg bg-gray-50">
                            <span className="text-sm">Current floor plan (PDF)</span>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemoveFloorPlan}
                              className="h-6 w-6 rounded-full p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <img src={floorPlanPreview} alt="Current floor plan" className="h-32 w-48 object-cover rounded-lg border" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemoveFloorPlan}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Input
                        id="floor_plan"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFloorPlanChange}
                        className={errors.floor_plan ? 'border-red-500' : ''}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('floor_plan')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        {floorPlanPreview ? 'Change Floor Plan' : 'Upload Floor Plan'}
                      </Button>
                    </div>
                    {errors.floor_plan && <p className="text-sm text-red-500">{errors.floor_plan}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link href={route('admin.venues.show', venue.id)}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Updating...' : 'Update Venue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default VenuesEdit;