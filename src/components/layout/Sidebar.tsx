import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const getNavLinkClass = (path: string) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link text-white';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMobileMenu = () => {
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    const isAdmin = user?.role === 'Admin';

    return (
        <div className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark sidebar ${isOpen ? 'show' : ''}`} style={{ width: '280px', height: '100vh', position: 'fixed', zIndex: 1000, transition: 'all 0.3s' }}>
            <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4 fw-bold">RRHH System</span>
            </div>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-1">
                    <Link to="/dashboard" className={getNavLinkClass('/dashboard')} onClick={closeMobileMenu}>
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                    </Link>
                </li>
                
                {isAdmin && (
                    <>
                        <li className="nav-item mb-1">
                            <Link to="/empleados" className={getNavLinkClass('/empleados')} onClick={closeMobileMenu}>
                                <i className="bi bi-people me-2"></i>
                                Gestión Empleados
                            </Link>
                        </li>
                        <li className="nav-item mb-1">
                            <Link to="/fichajes" className={getNavLinkClass('/fichajes')} onClick={closeMobileMenu}>
                                <i className="bi bi-clock-history me-2"></i>
                                Historial Fichajes
                            </Link>
                        </li>
                    </>
                )}

                {/* Adelantos siempre visible, pero para Admins también está dentro de Gestión Empleados */}
                <li className="nav-item mb-1">
                    <Link to="/adelantos" className={getNavLinkClass('/adelantos')} onClick={closeMobileMenu}>
                        <i className="bi bi-cash-coin me-2"></i>
                        Mis Adelantos
                    </Link>
                </li>

                {isAdmin && (
                    <>
                        <li className="nav-item mb-1">
                            <Link to="/reportes" className={getNavLinkClass('/reportes')} onClick={closeMobileMenu}>
                                <i className="bi bi-file-earmark-bar-graph me-2"></i>
                                Reportes
                            </Link>
                        </li>
                        <li className="nav-item mb-1 mt-3">
                            <Link to="/configuraciones" className={getNavLinkClass('/configuraciones')} onClick={closeMobileMenu}>
                                <i className="bi bi-gear me-2"></i>
                                Configuraciones
                            </Link>
                        </li>
                    </>
                )}
            </ul>
            <hr />
            <div className="dropdown">
                <div className="d-flex align-items-center text-white text-decoration-none mb-2">
                    <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-2" style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <strong>{user?.username}</strong>
                </div>
                <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;