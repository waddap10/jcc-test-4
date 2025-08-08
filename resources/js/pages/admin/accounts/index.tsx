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
import { Plus, Edit, Trash2, Eye, User, Building2, Phone, Shield } from 'lucide-react';
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
  department: Department | null;
  roles: Role[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedAccounts {
  data: Account[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface Props {
  users: PaginatedAccounts;
}

const AccountsIndex: React.FC<Props> = ({ users }) => {
  const handleDelete = (account: Account) => {
    router.delete(route('admin.accounts.destroy', account.id), {
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
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Account Management
          </h2>
          <Link href={route('admin.accounts.create')}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Account
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="Accounts - Admin" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Accounts
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and department assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No accounts found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first user account.
                  </p>
                  <Link href={route('admin.accounts.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">{account.name}</div>
                                <div className="text-sm text-gray-500">@{account.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {account.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{account.phone}</span>
                                </div>
                              )}
                              {!account.phone && (
                                <span className="text-sm text-gray-400">No phone</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {account.department ? (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <Badge variant="outline">
                                  {account.department.name}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No department</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {account.roles.length > 0 ? (
                                account.roles.map((role) => (
                                  <Badge
                                    key={role.id}
                                    variant="outline"
                                    className={getRoleColor(role.name)}
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">No roles</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(account.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={route('admin.accounts.show', account.id)}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={route('admin.accounts.edit', account.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
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
                                      onClick={() => handleDelete(account)}
                                      className="bg-red-600 hover:bg-red-700"
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
                  {users.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        Showing {users.data.length} of {users.total} accounts
                      </div>
                      <div className="flex gap-2">
                        {users.links.map((link, index) => {
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

export default AccountsIndex;