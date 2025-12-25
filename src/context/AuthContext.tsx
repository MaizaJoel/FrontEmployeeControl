import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

// Define the permissions mapping here for fallback (matches backend AppPermissions.cs)
// Define the permissions mapping here for fallback (matches backend AppPermissions.cs)
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    Admin: ['ALL'], // Special keyword for full access
    Asistente: [
        'Permissions.Dashboard.View',
        'Permissions.Employees.View',
        'Permissions.Employees.Create',
        'Permissions.Employees.Edit',
        'Permissions.Positions.View',
        'Permissions.Advances.ViewAll',
        'Permissions.Advances.Manage',
        'Permissions.Advances.Approve',
        'Permissions.TimeClock.ViewHistory',
        'Permissions.TimeClock.Mark',
        'Permissions.Reports.View',
        'Permissions.Holidays.View'
    ],
    Empleado: [ // 'Empleado' matches backend role name often used (or 'Employee'?) Backend says 'Employee', let's support both or check
        'Permissions.Dashboard.View',
        'Permissions.MyData.View',
        'Permissions.Advances.Request',
        'Permissions.TimeClock.Mark'
    ],
    Employee: [ // Duplicate for safety if role name varies
        'Permissions.Dashboard.View',
        'Permissions.MyData.View',
        'Permissions.Advances.Request',
        'Permissions.TimeClock.Mark'
    ]
};

interface User {
    username: string;
    fullName: string;
    email: string;
    role: string;
    permissions: string[];
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    hasPermission: (permission: string) => boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

interface DecodedToken {
    unique_name?: string;
    email?: string;
    role?: string | string[];
    Permission?: string | string[]; // Backend sends "Permission"
    Cedula?: string; // Explicit Cedula claim
    exp: number;
    [key: string]: any;
}

// Helper constants for claims
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to normalize permissions (from token or fallback)
    const getPermissions = (decoded: DecodedToken, role: string): string[] => {
        let permissions: string[] = [];

        // 1. Try to get from Token
        if (decoded.Permission) {
            if (Array.isArray(decoded.Permission)) {
                permissions = decoded.Permission;
            } else {
                permissions = [decoded.Permission];
            }
        }

        // 2. If no permissions in token (or empty), use fallback based on Role
        if (permissions.length === 0 && role) {
            // Check exact role match
            const roleKey = Object.keys(DEFAULT_ROLE_PERMISSIONS).find(k => k.toLowerCase() === role.toLowerCase());
            if (roleKey) {
                permissions = DEFAULT_ROLE_PERMISSIONS[roleKey];
            } else if (role === 'Admin') {
                permissions = ['ALL'];
            }
        }

        return permissions;
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);
                // Check expiration
                if (decoded.exp * 1000 > Date.now()) {
                    // Handle role being string or array
                    const rawRole = decoded.role || decoded[CLAIM_ROLE];
                    const userRole = Array.isArray(rawRole) ? rawRole[0] : rawRole || 'Employee';

                    // Extract accurate username (Prioritize Cedula, then generic name, then fallback)
                    const uniqueName = decoded.Cedula || decoded.unique_name || decoded.sub || decoded[CLAIM_NAME] || 'User';

                    const perms = getPermissions(decoded, userRole);

                    setUser({
                        username: uniqueName,
                        fullName: decoded.FullName || uniqueName,
                        email: decoded.email || '',
                        role: userRole,
                        permissions: perms,
                        token: storedToken
                    });
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const rawRole = decoded.role || decoded[CLAIM_ROLE];
            const userRole = Array.isArray(rawRole) ? rawRole[0] : rawRole || 'Employee';

            const uniqueName = decoded.Cedula || decoded.unique_name || decoded.sub || decoded[CLAIM_NAME] || 'User';

            const perms = getPermissions(decoded, userRole);

            setUser({
                username: uniqueName,
                fullName: decoded.FullName || uniqueName,
                email: decoded.email || '',
                role: userRole,
                permissions: perms,
                token: token
            });
        } catch (error) {
            console.error("Login failed: invalid token", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        if (user.role === 'Admin' || user.permissions.includes('ALL')) return true;
        return user.permissions.includes(permission);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};