import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth } = usePage().props;
    const user = auth.user;
    const roles = user?.roles || [];
    const permissions = user?.permissions || [];

    const hasRole = (role) => {
        return roles.includes(role);
    };

    const hasAnyRole = (roleList) => {
        return roleList.some(role => roles.includes(role));
    };

    const hasAllRoles = (roleList) => {
        return roleList.every(role => roles.includes(role));
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    return {
        user,
        roles,
        permissions,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        hasPermission,
        isAuthenticated: !!user,
    };
}