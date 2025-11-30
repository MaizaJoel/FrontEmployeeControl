import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
}

const Sidebar = ({ onClose, isCollapsed = false }: SidebarProps) => {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const handleLogout = () => {
        if (window.confirm('¿Cerrar sesión?')) {
            logout();
        }
    };

    const getNavLinkClass = (isActive: boolean) => {
        return `nav-link d-flex align-items-center py-3 px-3 text-white-50 ${isActive ? 'active text-white bg-primary bg-opacity-25 border-start border-3 border-primary' : 'hover-bg-dark'}`;
    };

    return (
        <div className="d-flex flex-column h-100 bg-dark text-white">
            {/* Header */}
            <div className="p-4 border-bottom border-secondary d-flex align-items-center justify-content-between" style={{ height: '80px' }}>
                {!isCollapsed && (
                    <div className="d-flex align-items-center animate-fade-in">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-building fs-5 text-white"></i>
                        </div>
                        <div>
                            <h6 className="m-0 fw-bold">Empresa S.A.</h6>
                            <small className="text-white-50" style={{ fontSize: '0.75rem' }}>Panel de Control</small>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-100 d-flex justify-content-center">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-building fs-5 text-white"></i>
                        </div>
                    </div>
                )}

                {onClose && (
                    <button className="btn btn-link text-white-50 p-0 d-md-none" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-grow-1 overflow-auto py-3">
                <nav className="nav flex-column gap-1">
                    <small className={`text-uppercase text-white-50 fw-bold px-3 mb-2 ${isCollapsed ? 'd-none' : 'd-block'}`} style={{ fontSize: '0.7rem' }}>
                        Principal
                    </small>

                    <NavLink to="/dashboard" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Dashboard">
                        <i className="bi bi-speedometer2 fs-5"></i>
                        {!isCollapsed && <span className="ms-3">Dashboard</span>}
                    </NavLink>

                    <NavLink to="/fichajes" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Registros Fichajes">
                        <i className="bi bi-cash-coin fs-5"></i>
                        {!isCollapsed && <span className="ms-3">Registros Fichajes</span>}
                    </NavLink>

                    {isAdmin && (
                        <>
                            <div className={`my-3 border-top border-secondary mx-3 ${isCollapsed ? 'd-none' : ''}`}></div>
                            <small className={`text-uppercase text-white-50 fw-bold px-3 mb-2 ${isCollapsed ? 'd-none' : 'd-block'}`} style={{ fontSize: '0.7rem' }}>
                                Administración
                            </small>

                            <NavLink to="/empleados" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Gestión RRHH">
                                <i className="bi bi-people fs-5"></i>
                                {!isCollapsed && <span className="ms-3">Gestión RRHH</span>}
                            </NavLink>

                            <NavLink to="/fichajes" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Control Fichajes">
                                <i className="bi bi-clock-history fs-5"></i>
                                {!isCollapsed && <span className="ms-3">Control Fichajes</span>}
                            </NavLink>

                            <NavLink to="/reportes" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Reportes">
                                <i className="bi bi-file-earmark-bar-graph fs-5"></i>
                                {!isCollapsed && <span className="ms-3">Reportes</span>}
                            </NavLink>

                            <NavLink to="/configuraciones" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Configuración">
                                <i className="bi bi-gear fs-5"></i>
                                {!isCollapsed && <span className="ms-3">Configuración</span>}
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-top border-secondary bg-black bg-opacity-25">
                <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : ''}`}>
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {!isCollapsed && (
                        <div className="ms-3 overflow-hidden">
                            <div className="fw-bold text-truncate">{user?.username}</div>
                            <div className="text-white-50 small text-truncate">{user?.role}</div>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button onClick={handleLogout} className="btn btn-link text-white-50 ms-auto p-0" title="Cerrar Sesión">
                            <i className="bi bi-box-arrow-right fs-5"></i>
                        </button>
                    )}
                </div>
                {isCollapsed && (
                    <div className="text-center mt-2">
                        <button onClick={handleLogout} className="btn btn-link text-white-50 p-0" title="Cerrar Sesión">
                            <i className="bi bi-box-arrow-right fs-5"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
