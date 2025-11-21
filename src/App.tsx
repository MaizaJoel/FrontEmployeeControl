import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

/* 1. Componente de Seguridad (Rutas Privadas)
Si NO hay token, te manda al Login.*/
const RutaProtegida = () => {
    const token = localStorage.getItem('token');
    return token ? <Outlet /> : <Navigate to="/" replace />;
};

/*  2. Componente de Invitado (Rutas Públicas)
Si YA hay token, te manda al Dashboard (para que no veas el login si ya entraste). */
const RutaPublica = () => {
    const token = localStorage.getItem('token');
    return !token ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* GRUPO 1: Rutas Públicas (Login) */}
                {/* Usan un layout simple o ninguno */}
                <Route element={<RutaPublica />}>
                    <Route path="/" element={<Login />} />
                </Route>

                {/* GRUPO 2: Rutas Privadas (Sistema) */}
                {/* Usan el MainLayout (Sidebar + Navbar) */}
                <Route element={<RutaProtegida />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/empleados" element={<div><h1>Gestión de Empleados</h1></div>} />
                        <Route path="/cargos" element={<div><h1>Gestión de Cargos</h1></div>} />
                        <Route path="/reportes" element={<div><h1>Reportes</h1></div>} />
                    </Route>
                </Route>

                {/* Ruta 404 (Opcional) */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
