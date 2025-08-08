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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, User, Shield, Building2, Phone, Lock } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  username: string;
  phone: string;
  password: string;
  password_confirmation: string;
  department_id: string;
  roles: number[];
}

interface Props {
  departments: Department[];
  roles: Role[];
}

const AccountsCreate: React.FC<Props> = ({ departments, roles }) => {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    username: '',
    phone: '',
    password: '',
    password_confirmation: '',
    department_id: '',
    roles: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.accounts.store'));
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setData('roles', [...data.roles, roleId]);
    } else {
      setData('roles', data.roles.filter(id => id !== roleId));
    }
  };

  const isPicRole = (roleName: string) => roleName.toLowerCase() === 'pic';
  const hasPicRole = roles.some(role => 
    data.roles.includes(role.id) && isPicRole(role.name)
  );

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'text-red-600',
      sales: 'text-blue-600',
      kanit: 'text-green-600',
      pic: 'text-purple-600',
    };
    return colors[roleName.toLowerCase()] || 'text-gray-600';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.accounts.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Create New Account
          </h2>
        </div>
      }
    >
      <Head title="Create Account - Admin" />

      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the user's personal and login details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Enter full name"
                      className={errors.name ? 'border-red-500' : ''}
                      autoFocus
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={data.username}
                      onChange={(e) => setData('username', e.target.value)}
                      placeholder="Enter username"
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>
                  Set the login password for this account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="Enter password"
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      placeholder="Confirm password"
                      className={errors.password_confirmation ? 'border-red-500' : ''}
                    />
                    {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </CardContent>
            </Card>

            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Assignment
                </CardTitle>
                <CardDescription>
                  Select the roles for this user account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={data.roles.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`role-${role.id}`} 
                        className={`text-sm font-medium ${getRoleColor(role.name)}`}
                      >
                        <Shield className="h-4 w-4 inline mr-1" />
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
                {data.roles.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Note: User will have limited access without any assigned roles
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Department Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Department Assignment
                </CardTitle>
                <CardDescription>
                  {hasPicRole 
                    ? 'Assign department (required for PIC role)'
                    : 'Optionally assign user to a department'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department_id">
                    Department {hasPicRole && '*'}
                  </Label>
                  <Select
                    value={data.department_id}
                    onValueChange={(value) => setData('department_id', value)}
                  >
                    <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No department</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {department.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && <p className="text-sm text-red-500">{errors.department_id}</p>}
                  {hasPicRole && (
                    <p className="text-sm text-blue-600">
                      Department assignment is required for users with PIC role
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link href={route('admin.accounts.index')}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AccountsCreate;