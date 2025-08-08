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
  User, 
  Shield, 
  Building2, 
  Phone,
  Calendar,
  UserPlus,
  UserMinus,
  Settings
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Role {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Account {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  department: Department | null;
  roles: Role[];
}

interface Props {
  account: Account;
}

const AccountsShow: React.FC<Props> = ({ account }) => {
  const handleDelete = () => {
    router.delete(route('admin.accounts.destroy', account.id), {
      onSuccess: () => {
        router.visit(route('admin.accounts.index'));
      },
    });
  };

  const handleDetachRole = (roleId: number) => {
    router.delete(route('admin.accounts.detach-role', [account.id, roleId]), {
      preserveScroll: true,
    });
  };

  const handleDetachDepartment = () => {
    router.delete(route('admin.accounts.detach-department', account.id), {
      preserveScroll: true,
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

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      sales: 'bg-blue-100 text-blue-800 border-blue-200',
      kanit: 'bg-green-100 text-green-800 border-green-200',
      pic: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.accounts.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold leading-tight text-gray-800">
                {account.name}
              </h2>
              <p className="text-sm text-gray-600">Account Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={route('admin.accounts.edit', account.id)}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the account for "{account.name}"? This action cannot be undone.
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
          </div>
        </div>
      }
    >
      <Head title={`${account.name} - Account Details`} />

      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Full Name</h4>
                    <p className="text-gray-600">{account.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Username</h4>
                    <p className="text-gray-600">@{account.username}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Phone Number</h4>
                    {account.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{account.phone}</span>
                      </div>
                    ) : (
                      <p className="text-gray-400">No phone number provided</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Assigned Roles ({account.roles.length})
                  </CardTitle>
                  <CardDescription>
                    Roles determine what actions this user can perform
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {account.roles.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No roles assigned</h3>
                  <p className="text-gray-500 mb-4">This user has no roles and will have limited access.</p>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign First Role
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {account.roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <Badge variant="outline" className={getRoleColor(role.name)}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove the "{role.name}" role from {account.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDetachRole(role.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove Role
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Department Assignment
                  </CardTitle>
                  <CardDescription>
                    Department determines organizational structure and access
                  </CardDescription>
                </div>
                {account.department ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Department</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {account.name} from the "{account.department.name}" department?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDetachDepartment}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove from Department
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Department
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {account.department ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{account.department.name}</p>
                      <p className="text-sm text-gray-500">Department member</p>
                    </div>
                  </div>
                  <Link href={route('admin.departments.show', account.department.id)}>
                    <Button variant="outline" size="sm">
                      View Department
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No department assigned</h3>
                  <p className="text-gray-500 mb-4">This user is not assigned to any department.</p>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Department
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Status & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">Account Status</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">{account.roles.length}</div>
                  <div className="text-sm text-gray-600">Assigned Roles</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {account.department ? '1' : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Department</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Account Created</h4>
                  <p className="text-gray-600">{formatDate(account.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Last Updated</h4>
                  <p className="text-gray-600">{formatDate(account.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
                {!account.department && (
                  <Button variant="outline" size="sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    Assign Department
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  View Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AccountsShow;