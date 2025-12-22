import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import EmployeeManagement from './pages/rrhh/EmployeeManagement';
import Adelantos from './pages/rrhh/Adelantos';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import KioscoLayout from './components/layout/KioscoLayout';
import Kiosco from './pages/kiosco/Kiosco';
import './styles/TableStyles.css';
import Fichajes from './pages/rrhh/Fichajes';
import Reportes from './pages/rrhh/Reportes';
import ConfiguracionesPage from './pages/admin/ConfiguracionesPage';
import ConfiguracionTasas from './pages/rrhh/ConfiguracionTasas';
import { useAuth } from './context/AuthContext';
import ConfiguracionesGeneral from './pages/admin/tabs/ConfiguracionesGeneral';
import ConfiguracionesFeriados from './pages/admin/tabs/ConfiguracionesFeriados';

// Imports for Employee Tabs
import Empleados from './pages/rrhh/Empleados';
import Cargos from './pages/rrhh/Cargos';
import Roles from './pages/rrhh/Roles';
import UserRoles from './pages/rrhh/UserRoles';

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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RutaPublica />}>
                    <Route path="/" element={<Login />} />
                </Route>

                <Route element={<KioscoLayout />}>
                    <Route path="/kiosco" element={<Kiosco />} />
                </Route>

                <Route element={<RutaProtegida />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />

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
                            </Route>
                        </Route>

                        {/* Config Module guarded by Settings.View */}
                        <Route element={<PermissionGuard permission="Permissions.Settings.View" />}>
                            <Route path="/configuraciones" element={<ConfiguracionesPage />}>
                                <Route index element={<Navigate to="general" replace />} />
                                <Route path="general" element={<ConfiguracionesGeneral />} />
                                <Route path="feriados" element={<ConfiguracionesFeriados />} />
                                <Route path="tasas" element={<ConfiguracionTasas />} />
                            </Route>
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;