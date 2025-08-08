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
import { Plus, Edit, Trash2, Eye, Building2, Users, FileText, Package } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Department {
  id: number;
  name: string;
  created_at: string;
  users_count: number;
  beo_count: number;
  packages_count: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedDepartments {
  data: Department[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface Props {
  departments: PaginatedDepartments;
}

const DepartmentsIndex: React.FC<Props> = ({ departments }) => {
  const handleDelete = (department: Department) => {
    router.delete(route('admin.departments.destroy', department.id), {
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

  const getTotalItems = (department: Department) => {
    return department.users_count + department.beo_count + department.packages_count;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Department Management
          </h2>
          <Link href={route('admin.departments.create')}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Department
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="Departments - Admin" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Departments
              </CardTitle>
              <CardDescription>
                Manage organizational departments and their associated resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {departments.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No departments found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first department.
                  </p>
                  <Link href={route('admin.departments.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Name</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>BEOs</TableHead>
                        <TableHead>Packages</TableHead>
                        <TableHead>Total Items</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.data.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{department.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {department.users_count}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-500" />
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                {department.beo_count}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-purple-500" />
                              <Badge variant="outline" className="text-purple-600 border-purple-200">
                                {department.packages_count}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getTotalItems(department)} items
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(department.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={route('admin.departments.show', department.id)}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={route('admin.departments.edit', department.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    disabled={getTotalItems(department) > 0}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{department.name}"? This action cannot be undone.
                                      {getTotalItems(department) > 0 && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                                          This department has {getTotalItems(department)} associated items and cannot be deleted.
                                        </div>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(department)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={getTotalItems(department) > 0}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {departments.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        Showing {departments.data.length} of {departments.total} departments
                      </div>
                      <div className="flex gap-2">
                        {departments.links.map((link, index) => {
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

export default DepartmentsIndex;