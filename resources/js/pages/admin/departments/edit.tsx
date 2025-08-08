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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Building2, Users, FileText, Package } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Department {
  id: number;
  name: string;
  users_count: number;
  beo_count: number;
  packages_count: number;
}

interface FormData {
  name: string;
  _method: string;
}

interface Props {
  department: Department;
}

const DepartmentsEdit: React.FC<Props> = ({ department }) => {
  const { data, setData, patch, processing, errors } = useForm<FormData>({
    name: department.name,
    _method: 'PATCH',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('admin.departments.update', department.id));
  };

  const getTotalItems = () => {
    return department.users_count + department.beo_count + department.packages_count;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.departments.show', department.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
              Edit Department
            </h2>
            <p className="text-sm text-gray-600">{department.name}</p>
          </div>
        </div>
      }
    >
      <Head title={`Edit ${department.name} - Admin`} />

      <div className="py-12">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Department Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Department Information
                </CardTitle>
                <CardDescription>
                  Update the department details
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
                    placeholder="Enter department name"
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

            {/* Current Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Department Statistics</CardTitle>
                <CardDescription>
                  Overview of items currently associated with this department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-xl font-bold text-gray-900">{department.users_count}</div>
                    <div className="text-sm text-gray-600">Staff Members</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-xl font-bold text-gray-900">{department.beo_count}</div>
                    <div className="text-sm text-gray-600">BEOs</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Package className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-xl font-bold text-gray-900">{department.packages_count}</div>
                    <div className="text-sm text-gray-600">Packages</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge variant="secondary">
                    Total: {getTotalItems()} items
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            {getTotalItems() > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-blue-600">Important Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      This department currently has {getTotalItems()} associated items. 
                      Changing the department name will update it across all related records including 
                      staff assignments, BEOs, and packages.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link href={route('admin.departments.show', department.id)}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Updating...' : 'Update Department'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DepartmentsEdit;