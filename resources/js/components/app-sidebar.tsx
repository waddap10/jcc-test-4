import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BellElectric, Briefcase, Building, Calendar, LayoutGrid, ListOrdered, SatelliteDish, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { useAuth } from '@/hooks/useAuth';

// Define navigation items for different roles
const adminNavItems: NavItem[] = [
    /* {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    }, */
    {
        title: 'Orders',
        href: '/orders',
        icon: ListOrdered,
    },
    {
        title: 'Calendars',
        href: '/calendars',
        icon: Calendar,
    },
    // Add other admin-specific items here
     {
         title: 'Customers',
         href: '/customers',
         icon: Users,
     },
     {
         title: 'Venues',
         href: '/venues',
         icon: Building,
     },
    // {
    //     title: 'Departments',
    //     href: '/departments',
    //     icon: BellElectric,
    // },
];

const kanitNavItems: NavItem[] = [
    /* {
        title: 'Dashboard',
        href: '/kanit/dashboard',
        icon: LayoutGrid,
    }, */
    // Add kanit-specific navigation items here
];

const picNavItems: NavItem[] = [
    /* {
        title: 'Dashboard',
        href: '/pic/dashboard',
        icon: LayoutGrid,
    }, */
    // Add pic-specific navigation items here
];

const footerNavItems: NavItem[] = [
   
];

export function AppSidebar() {
    const { user, hasRole } = useAuth();
    
    // Determine which navigation items to show based on user role
    const getNavItems = () => {
        if (!user) return [];
        
        if (hasRole('admin')) {
            return adminNavItems;
        } else if (hasRole('kanit')) {
            return kanitNavItems;
        } else if (hasRole('pic')) {
            return picNavItems;
        }
        
        return [];
    };
    
    const navItems = getNavItems();
    
    // Get the appropriate dashboard link based on role
    const getDashboardRoute = () => {
        if (hasRole('admin')) {
            return 'dashboard';
        } else if (hasRole('kanit')) {
            return 'kanit.dashboard';
        }
        return 'pic.dashboard';
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route(getDashboardRoute())} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}