import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Dashboard from './features/dashboard/Dashboard'; // Moved to features
import EmployeeManagement from './features/employees/pages/EmployeeManagement';
import Adelantos from './features/employees/pages/Advances'; // Assuming moved/renamed or just generic
import MainLayout from './shared/components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import KioscoLayout from './shared/components/layout/KioscoLayout';
import Kiosco from './features/attendance/pages/Kiosco';
import './shared/styles/TableStyles.css';
import Fichajes from './features/attendance/pages/Fichajes'; // Updated path
import Reportes from './features/reports/pages/MyReports';
import ConfiguracionesPage from './features/configuration/pages/ConfigurationPage';
import ConfiguracionTasas from './features/configuration/pages/RatesConfig';
import { useAuth } from './context/AuthContext';
import ConfiguracionesGeneral from './features/configuration/pages/GeneralConfig';
import ConfiguracionesFeriados from './features/configuration/pages/HolidaysConfig';
import EmailConfig from './features/configuration/pages/EmailConfig';
import PersonalClockIn from './features/attendance/pages/PersonalClockIn';
import NominaHistory from './features/nominas/NominaHistory';
import NominaGenerator from './features/nominas/NominaGenerator';

// Imports for Employee Tabs
import Empleados from './features/employees/pages/EmployeeList';
import Cargos from './features/employees/pages/Cargos'; // Check filename
import Roles from './features/employees/pages/Roles';
import UserRoles from './features/employees/pages/UserRoles'; // Check filename

const RutaProtegida = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const RutaPublica = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Generic Guard for specific permissions
const PermissionGuard = ({ permission }: { permission: string }) => {
    const { hasPermission } = useAuth();
    if (!hasPermission(permission)) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
};

import { ConfigProvider } from './context/ConfigContext';

function App() {
    return (
        <ConfigProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<RutaPublica />}>
                        <Route path="/" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>

                    <Route element={<KioscoLayout />}>
                        <Route path="/kiosco" element={<Kiosco />} />
                    </Route>

                    <Route element={<RutaProtegida />}>
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/marcar-asistencia" element={<PersonalClockIn />} />

                            {/* Ruta para empleados normales (solo ven sus adelantos) */}
                            <Route path="/adelantos" element={<Adelantos />} />

                            {/* RRHH Module */}
                            <Route path="/rrhh">
                                {/* Employee Management guarded by Employees.View */}
                                <Route element={<PermissionGuard permission="Permissions.Employees.View" />}>
                                    <Route path="empleados" element={<EmployeeManagement />}>
                                        <Route index element={<Navigate to="lista" replace />} />
                                        <Route path="lista" element={<Empleados />} />
                                        <Route path="cargos" element={<Cargos />} />
                                        <Route path="roles" element={<Roles />} />
                                        <Route path="asignacion" element={<UserRoles />} />
                                        <Route path="adelantos" element={<Adelantos />} />
                                    </Route>
                                </Route>

                                {/* Fichajes guarded by TimeClock.ViewHistory */}
                                <Route element={<PermissionGuard permission="Permissions.TimeClock.ViewHistory" />}>
                                    <Route path="fichajes" element={<Fichajes />} />
                                </Route>

                                {/* Reportes guarded by Reports.View */}
                                <Route element={<PermissionGuard permission="Permissions.Reports.View" />}>
                                    <Route path="reportes" element={<Reportes />} />
                                    <Route element={<PermissionGuard permission="Permissions.Payroll.View" />}>
                                        <Route path="nominas" element={<NominaHistory />} />
                                        <Route element={<PermissionGuard permission="Permissions.Payroll.Manage" />}>
                                            <Route path="nominas/generar" element={<NominaGenerator />} />
                                        </Route>
                                    </Route>
                                </Route>
                            </Route>

                            {/* Config Module guarded by Settings.View */}
                            <Route element={<PermissionGuard permission="Permissions.Settings.View" />}>
                                <Route path="/configuraciones" element={<ConfiguracionesPage />}>
                                    <Route index element={<Navigate to="general" replace />} />
                                    <Route path="general" element={<ConfiguracionesGeneral />} />
                                    <Route path="feriados" element={<ConfiguracionesFeriados />} />
                                    <Route path="tasas" element={<ConfiguracionTasas />} />
                                    <Route path="email" element={<EmailConfig />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;