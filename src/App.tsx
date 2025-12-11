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
import { useAuth } from './context/AuthContext';

const RutaProtegida = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const RutaPublica = () => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const RutaAdmin = () => {
    const { hasPermission } = useAuth();
    // Allow if has Settings.View OR Employees.View (covers Asistente case)
    if (!hasPermission('Permissions.Settings.View') && !hasPermission('Permissions.Employees.View')) {
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

                        <Route element={<RutaAdmin />}>
                            {/* Ruta unificada para gestión de RRHH */}
                            <Route path="/empleados" element={<EmployeeManagement />} />

                            <Route path="/fichajes" element={<Fichajes />} />
                            <Route path="/reportes" element={<Reportes />} />
                            <Route path="/configuraciones" element={<ConfiguracionesPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;