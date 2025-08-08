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
import { ArrowLeft, Save, Upload, MapPin } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

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
}

const VenuesCreate: React.FC = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null);

  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    short: '',
    photo: null,
    description: '',
    dimension_m: '',
    dimension_f: '',
    setup_banquet: '',
    setup_classroom: '',
    setup_theater: '',
    setup_reception: '',
    floor_plan: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.venues.store'));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('photo', file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFloorPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('floor_plan', file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFloorPlanPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFloorPlanPreview(null);
      }
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.venues.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Create New Venue
          </h2>
        </div>
      }
    >
      <Head title="Create Venue - Admin" />

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
                  Enter the basic details for the new venue
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
                  Specify the venue dimensions
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
                  Upload venue photo and floor plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Venue Photo</Label>
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
                      Choose File
                    </Button>
                  </div>
                  {errors.photo && <p className="text-sm text-red-500">{errors.photo}</p>}
                  {photoPreview && (
                    <div className="mt-2">
                      <img src={photoPreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>

                {/* Floor Plan Upload */}
                <div className="space-y-2">
                  <Label htmlFor="floor_plan">Floor Plan</Label>
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
                      Choose File
                    </Button>
                  </div>
                  {errors.floor_plan && <p className="text-sm text-red-500">{errors.floor_plan}</p>}
                  {floorPlanPreview && (
                    <div className="mt-2">
                      <img src={floorPlanPreview} alt="Floor Plan Preview" className="h-32 w-48 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link href={route('admin.venues.index')}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Creating...' : 'Create Venue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default VenuesCreate;