// resources/js/layouts/app/app-sidebar-layout.tsx

import { AppContent }       from '@/components/app-content'
import { AppShell }         from '@/components/app-shell'
import { AppSidebar }       from '@/components/app-sidebar'
import { AppSidebarHeader } from '@/components/app-sidebar-header'
import { type BreadcrumbItem } from '@/types'
import { type PropsWithChildren } from 'react'

interface AppSidebarLayoutProps {
  breadcrumbs?: BreadcrumbItem[]
  hideSidebar?: boolean
}

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
  hideSidebar = false,       // default to showing the sidebar
}: PropsWithChildren<AppSidebarLayoutProps>) {
  return (
    <AppShell variant="sidebar">
      {/* only render the real sidebar when hideSidebar===false */}
      {!hideSidebar && <AppSidebar />}

      <AppContent variant="sidebar" className="overflow-x-hidden">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </AppContent>
    </AppShell>
  )
}