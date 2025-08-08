import { Head, useForm, router } from '@inertiajs/react' // Add router import

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'

interface Order {
    id: number
    custom_code: string
    event_name: string
    event?: { event_type: string; code: string }
}

interface Props {
    order: Order
}

export default function AttachmentCreate({ order }: Props) {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
    const { data, setData, post, processing, errors } = useForm<{ files: File[] }>({
        files: []
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            // Check file sizes
            const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024) // 5MB
            if (oversizedFiles.length > 0) {
                alert(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max 5MB per file.`)
                return
            }

            // Check number of files
            if (files.length > 5) {
                alert('Maximum 5 files allowed at once.')
                return
            }
        }
        setSelectedFiles(files)
        setData('files', files ? Array.from(files) : [])
    }

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    data.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
    })
    
    router.post(route('orders.attachments.store', order.id), formData, {
        forceFormData: true,
        onSuccess: () => {
            // Redirect handled by controller
        },
        onError: (errors) => {
            console.log('Upload errors:', errors)
        }
    })
}

    return (
        <AppLayout breadcrumbs={[
            { title: 'Orders', href: '/orders' },
            { title: `${order.custom_code} - Attachments`, href: route('orders.attachments.index', order.id) },
            { title: 'Add Attachments', href: '' }
        ]}>
            <Head title={`Add Attachments - ${order.custom_code}`} />

            <div className="space-y-6 px-6 py-4">
                <div>
                    <h1 className="text-xl font-semibold">Add Attachments</h1>
                    <p className="text-gray-600">
                        {order.custom_code} - {order.event_name}
                        {order.event && ` (${order.event.event_type})`}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="files">Select Files</Label>
                        <Input
                            id="files"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.files && (
                            <p className="text-red-600 text-sm">{errors.files}</p>
                        )}
                        <p className="text-sm text-gray-500">
                            You can select up to 5 files (max 5MB each)
                        </p>
                    </div>

                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <Label>Selected Files:</Label>
                            <ul className="list-disc list-inside space-y-1">
                                {Array.from(selectedFiles).map((file, index) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !selectedFiles || selectedFiles.length === 0}
                        >
                            {processing ? 'Uploading...' : 'Upload Files'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}