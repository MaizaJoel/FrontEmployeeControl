import { Link, useNavigate } from 'react-router-dom';

interface SidebarProps {
    isMobile: boolean;
    closeMobileMenu?: () => void;
}

const Sidebar = ({ isMobile, closeMobileMenu }: SidebarProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Clase base para los links
    const navLinkClass = "nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-2 hover-effect";

    return (
        <div className={`d-flex flex-column flex-shrink-0 p-3 text-bg-dark ${isMobile ? 'h-100' : ''}`}
            style={{ width: isMobile ? '100%' : '250px', height: '100vh' }}>

            <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4 fw-bold">RRHH System</span>
                {isMobile && (
                    <button className="btn btn-sm btn-outline-light ms-auto" onClick={closeMobileMenu}>
                        ✕
                    </button>
                )}
            </div>

            <hr />

            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-1">
                    <Link to="/dashboard" className={navLinkClass} onClick={closeMobileMenu}>
                        Dashboard
                    </Link>
                </li>
                <li className="nav-item mb-1">
                    <Link to="/empleados" className={navLinkClass} onClick={closeMobileMenu}>
                        Empleados
                    </Link>
                </li>
                <li className="nav-item mb-1">
                    <Link to="/cargos" className={navLinkClass} onClick={closeMobileMenu}>
                        Cargos
                    </Link>
                </li>
                <li className="nav-item mb-1">
                    <Link to="/adelantos" className={navLinkClass} onClick={closeMobileMenu}>
                        Adelantos
                    </Link>
                </li>
                <li className="nav-item mb-1">
                    <Link to="/reportes" className={navLinkClass} onClick={closeMobileMenu}>
                        Reportes
                    </Link>
                </li>
            </ul>

            <hr />

            <div className="dropdown">
                <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
