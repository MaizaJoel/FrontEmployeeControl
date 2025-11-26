import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Cargos from './pages/rrhh/Cargos';
import Empleados from './pages/rrhh/Empleados';
import Adelantos from './pages/rrhh/Adelantos';
import MainLayout from './components/layout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import KioscoLayout from './components/layout/KioscoLayout';
import Kiosco from './pages/kiosco/Kiosco';
import Fichajes from './pages/rrhh/Fichajes';

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

                {/* GRUPO 3: Kiosco (Público) */}
                <Route element={<KioscoLayout />}>
                    <Route path="/kiosco" element={<Kiosco />} />
                </Route>

                {/* GRUPO 2: Rutas Privadas (Sistema) */}
                {/* Usan el MainLayout (Sidebar + Navbar) */}
                <Route element={<RutaProtegida />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/empleados" element={<Empleados />} />
                        <Route path="/fichajes" element={<Fichajes />} />
                        <Route path="/cargos" element={<Cargos />} />
                        <Route path="/adelantos" element={<Adelantos />} />
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
