import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit3, Trash2, Megaphone, Paperclip } from 'lucide-react';
import {route} from 'ziggy-js';

interface Department { id: number; name: string; }
interface Package { id: number; name: string; }
interface User {
  id:       number;
  name:     string;
  username: string;
  phone:    string;
}

interface BeoAttachment {
  id: number;
  beo_id: number;
  file_name: string;
  created_at: string;
}

interface Beo {
  id:          number;
  department?: Department;
  package?:      Package;
  user?:       User;
  notes:       string | null;
  created_at:  string;
  attachments?: BeoAttachment[];
}

interface Order { id: number; event_name: string; }

interface PageProps {
  flash?: { message?: string };
  order:  Order;
  beos:   Beo[];
  
  [key: string]: unknown;
}

export default function Index() {
  const { order, beos, flash = {} } = usePage<PageProps>().props;
  const { delete: destroy, processing } = useForm();

  const handleDelete = (id: number) => {
    if (!confirm(`Delete assignment #${id}?`)) return;
    destroy(route('orders.beos.destroy', [order.id, id]), {
      onSuccess: () => window.location.reload(),
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: route('orders.index') },
    {
      title: `BEOs for ${order.event_name}`,
      href:  route('orders.beos.index', [order.id]),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Order #${order.id} — BEO Assignments`} />

      {flash.message && (
        <div className="m-4">
          <Alert>
            <Megaphone className="h-4 w-4" />
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>{flash.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="m-4 flex space-x-2">
        <Link href={route('orders.beos.create', [order.id])}>
          <Button className="rounded bg-black px-4 py-2 text-white hover:bg-white hover:text-black">
            New Assignment
          </Button>
        </Link>
        
        {beos.length > 0 && (
          <Link href={route('orders.beos.edit', [order.id])}>
            <Button variant="outline" className="rounded px-4 py-2">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit All
            </Button>
          </Link>
        )}
      </div>

      {beos.length > 0 ? (
        <div className="m-4 overflow-auto">
          <Table>
            <TableCaption>Assignments for "{order.event_name}"</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beos.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.department?.name ?? '—'}</TableCell>
                  <TableCell>{b.package?.name      ?? '—'}</TableCell>
                  <TableCell>{b.user?.name       ?? '—'}</TableCell>
                  <TableCell>{b.user?.phone      ?? '—'}</TableCell>
                  <TableCell>{b.notes            ?? '—'}</TableCell>
                  <TableCell>
                    {b.attachments && b.attachments.length > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{b.attachments.length}</span>
                        <div className="space-y-1 max-w-32">
                          {b.attachments.map((attachment) => (
                            <div key={attachment.id} className="text-xs text-blue-600 truncate">
                              <a 
                                href={`/storage/beo-attachments/${attachment.file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {attachment.file_name}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(b.id)}
                      disabled={processing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="m-4 text-center text-gray-600">
          No assignments found for this order.
        </p>
      )}
    </AppLayout>
  );
}