import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Megaphone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Departments', href: '/departments' },
];

interface Department {
  id: number;
  name: string;
}

interface PageProps {
  flash: { message?: string };
  departments: Department[];
  [key: string]: any;
}

export default function Index() {
  const { departments, flash = { message: '' } } = usePage<PageProps>().props;
  const { processing, delete: destroy } = useForm();

  function handleDelete(id: number, name: string) {
    if (confirm(`Delete department #${id} – ${name}?`)) {
      destroy(route('departments.destroy', id));
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Departments" />

      <div className="m-4 inline-flex">
        <Link href={route('departments.create')}>
          <Button>Create Department</Button>
        </Link>
      </div>

      {flash.message && (
        <div className="m-4">
          <Alert>
            <Megaphone className="h-4 w-4" />
            <AlertTitle>Notification</AlertTitle>
            <AlertDescription>{flash.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {departments.length ? (
        <div className="m-4">
          <Table>
            <TableCaption>List of all Departments</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.id}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell className="text-center space-x-2">
                    {/* <Link href={route('departments.edit', dept.id)}>
                      <Button className="bg-blue-500 hover:bg-blue-700">
                        Edit
                      </Button>
                    </Link> */}
                    <Link href={route('departments.pics.index', dept.id)}>
   <Button className="bg-green-500 hover:bg-green-700">
     View Pics
   </Button>
 </Link>

                    <Button
                      disabled={processing}
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="bg-red-500 hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="px-4 py-10 text-center text-gray-500">
          No department found.
        </p>
      )}
    </AppLayout>
  );
}