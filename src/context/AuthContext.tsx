import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

interface User {
    username: string;
    email: string;
    role: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
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
    exp: number;
    [key: string]: any;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);
                // Check expiration
                if (decoded.exp * 1000 > Date.now()) {
                     // Handle role being string or array
                     // The claim name might be different depending on backend mapping, 
                     // but usually 'role' or the full URI. jwt-decode often handles standard ones.
                     // We'll check 'role' and 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                     const rawRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                     const userRole = Array.isArray(rawRole) ? rawRole[0] : rawRole || 'Employee';

                     setUser({
                        username: decoded.unique_name || decoded.sub || 'User',
                        email: decoded.email || '',
                        role: userRole,
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
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const rawRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const userRole = Array.isArray(rawRole) ? rawRole[0] : rawRole || 'Employee';
            
            setUser({
                username: decoded.unique_name || decoded.sub || 'User',
                email: decoded.email || '',
                role: userRole,
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

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};