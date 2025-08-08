import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AppLayout from '@/layouts/app-layout'
import { useForm, usePage } from '@inertiajs/react'

interface Order {
    id: number
    custom_code: string
    event_name: string
    event?: { event_type: string; code: string }
    customer?: { organizer: string }
}

interface Attachment {
    id: number
    file_name: string
    created_at: string
}

interface Props {
    order: Order
    attachments: Attachment[]
    flash?: { message?: string }
}

export default function AttachmentIndex({ order, attachments, flash }: Props) {
    const { delete: destroy } = useForm()

    const handleDelete = (attachment: Attachment) => {
        if (confirm(`Delete ${attachment.file_name}?`)) {
            destroy(route('attachments.destroy', attachment.id))
        }
    }

    const downloadFile = (fileName: string) => {
        window.open(`/storage/attachments/${fileName}`, '_blank')
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Orders', href: '/orders' },
            { title: `${order.custom_code} - Attachments`, href: '' }
        ]}>
            <Head title={`Attachments - ${order.custom_code}`} />

            <div className="space-y-6 px-6 py-4">
                {flash?.message && (
                    <Alert>
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Attachments</h1>
                        <p className="text-gray-600">
                            {order.custom_code} - {order.event_name} 
                            {order.event && ` (${order.event.event_type})`}
                        </p>
                    </div>
                    <Link href={route('orders.attachments.create', order.id)}>
                        <Button>Add Attachments</Button>
                    </Link>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attachments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500">
                                    No attachments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            attachments.map((attachment) => (
                                <TableRow key={attachment.id}>
                                    <TableCell className="font-medium">
                                        {attachment.file_name}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(attachment.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => downloadFile(attachment.file_name)}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(attachment)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    )
}