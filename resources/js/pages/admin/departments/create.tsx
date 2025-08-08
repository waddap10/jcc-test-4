import React from 'react';
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
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface FormData {
  name: string;
}

const DepartmentsCreate: React.FC = () => {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.departments.store'));
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.departments.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Create New Department
          </h2>
        </div>
      }
    >
      <Head title="Create Department - Admin" />

      <div className="py-12">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Department Information
                </CardTitle>
                <CardDescription>
                  Create a new department for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter department name (e.g., Marketing, Sales, Operations)"
                    className={errors.name ? 'border-red-500' : ''}
                    autoFocus
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  <p className="text-sm text-gray-500">
                    Choose a clear, descriptive name for the department
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What happens after creation?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Staff Assignment</p>
                    <p className="text-sm text-gray-600">You can assign staff members to this department</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">BEO Management</p>
                    <p className="text-sm text-gray-600">Business Event Orders can be linked to this department</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Package Organization</p>
                    <p className="text-sm text-gray-600">Service packages can be organized by department</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link href={route('admin.departments.index')}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Creating...' : 'Create Department'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DepartmentsCreate;