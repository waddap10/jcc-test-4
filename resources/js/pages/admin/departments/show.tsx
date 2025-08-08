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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  Users, 
  FileText, 
  Package,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Beo {
  id: number;
  name: string;
}

interface PackageItem {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  users_count: number;
  beo_count: number;
  packages_count: number;
  users: User[];
  beo: Beo[];
  packages: PackageItem[];
}

interface Props {
  department: Department;
}

const DepartmentsShow: React.FC<Props> = ({ department }) => {
  const handleDelete = () => {
    router.delete(route('admin.departments.destroy', department.id), {
      onSuccess: () => {
        router.visit(route('admin.departments.index'));
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

  const getTotalItems = () => {
    return department.users_count + department.beo_count + department.packages_count;
  };

  const canDelete = getTotalItems() === 0;

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.departments.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold leading-tight text-gray-800">
                {department.name}
              </h2>
              <p className="text-sm text-gray-600">Department Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={route('admin.departments.edit', department.id)}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  disabled={!canDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Department</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{department.name}"? This action cannot be undone.
                    {!canDelete && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                        This department has {getTotalItems()} associated items and cannot be deleted.
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={!canDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      }
    >
      <Head title={`${department.name} - Department Details`} />

      <div className="py-12">
        <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 space-y-6">
          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {department.name}
              </CardTitle>
              <CardDescription>
                Department overview and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-900">{department.users_count}</div>
                  <div className="text-sm text-gray-600">Staff Members</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-gray-900">{department.beo_count}</div>
                  <div className="text-sm text-gray-600">BEOs</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-gray-900">{department.packages_count}</div>
                  <div className="text-sm text-gray-600">Packages</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members ({department.users_count})
              </CardTitle>
              <CardDescription>
                Staff members assigned to this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff assigned</h3>
                  <p className="text-gray-500">No staff members are currently assigned to this department.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {department.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={route('admin.accounts.show', user.id)}>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* BEOs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Business Event Orders ({department.beo_count})
              </CardTitle>
              <CardDescription>
                BEOs managed by this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.beo.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No BEOs assigned</h3>
                  <p className="text-gray-500">No Business Event Orders are currently assigned to this department.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>BEO Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {department.beo.map((beo) => (
                      <TableRow key={beo.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{beo.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View BEO
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Packages ({department.packages_count})
              </CardTitle>
              <CardDescription>
                Service packages offered by this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.packages.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No packages assigned</h3>
                  <p className="text-gray-500">No service packages are currently assigned to this department.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {department.packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{pkg.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View Package
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

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
                  <p className="text-gray-600">{formatDate(department.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Last Updated</h4>
                  <p className="text-gray-600">{formatDate(department.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DepartmentsShow;