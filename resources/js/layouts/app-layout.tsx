import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';


interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  const { auth, hideSidebar: hideFromPage } =
    usePage<SharedData & { hideSidebar?: boolean }>().props;

  const roles = auth.user?.roles?.map(r => r.name) ?? [];

  // page‐level flag wins, otherwise fallback to “manager only” logic
  const hideSidebar =
    typeof hideFromPage === 'boolean'
      ? hideFromPage
      : roles.includes('manager');

  return (
    <AppLayoutTemplate
      breadcrumbs={breadcrumbs}
      hideSidebar={hideSidebar}
    >
      {children}
    </AppLayoutTemplate>
  );
}


