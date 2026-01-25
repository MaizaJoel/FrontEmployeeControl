import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useConfig } from '../../../context/ConfigContext';
import ChangePasswordModal from '../../../features/auth/components/ChangePasswordModal';

interface SidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
}

// Collapsible section component
interface CollapsibleSectionProps {
    title: string;
    icon: string;
    isCollapsed: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    basePath?: string; // To detect if any child is active
}

const CollapsibleSection = ({ title, icon, isCollapsed, isExpanded, onToggle, children, basePath }: CollapsibleSectionProps) => {
    const location = useLocation();
    const isActive = basePath ? location.pathname.startsWith(basePath) : false;

    return (
        <div className="collapsible-section">
            <button
                onClick={onToggle}
                className={`nav-link d-flex align-items-center py-3 px-3 w-100 border-0 bg-transparent text-start ${isActive ? 'text-white' : 'text-white-50'}`}
                style={{ cursor: 'pointer' }}
            >
                <i className={`bi ${icon} fs-5`}></i>
                {!isCollapsed && (
                    <>
                        <span className="ms-3 flex-grow-1">{title}</span>
                        <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`} style={{ fontSize: '0.75rem' }}></i>
                    </>
                )}
            </button>
            {isExpanded && !isCollapsed && (
                <div className="ps-4 animate-fade-in" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ onClose, isCollapsed = false }: SidebarProps) => {
    const { user, logout, hasPermission } = useAuth();
    const { getConfig } = useConfig();
    const location = useLocation();

    // Expanded states for each section
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        rrhh: false,
        empleados: false,
        asistencia: false,
        nominas: false,
        reportes: false,
    });

    // Auto-expand section if current path matches
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/rrhh')) {
            setExpandedSections(prev => ({ ...prev, rrhh: true }));
            if (path.includes('/empleados') || path.includes('/cargos') || path.includes('/roles') || path.includes('/asignacion') || path.includes('/adelantos')) {
                setExpandedSections(prev => ({ ...prev, empleados: true }));
            }
            if (path.includes('/fichajes')) {
                setExpandedSections(prev => ({ ...prev, asistencia: true }));
            }
            if (path.includes('/nominas')) {
                setExpandedSections(prev => ({ ...prev, nominas: true }));
            }
            if (path.includes('/reportes')) {
                setExpandedSections(prev => ({ ...prev, reportes: true }));
            }
        }
    }, [location.pathname]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Show Admin section if has ANY of the main administrative permissions
    const showRRHH = hasPermission('Permissions.Employees.View') ||
        hasPermission('Permissions.Reports.View') ||
        hasPermission('Permissions.Payroll.View') ||
        hasPermission('Permissions.TimeClock.ViewHistory');

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleLogout = () => {
        if (window.confirm('¿Cerrar sesión?')) {
            logout();
        }
    };

    const getNavLinkClass = (isActive: boolean) => {
        return `nav-link d-flex align-items-center py-2 px-3 text-white-50 ${isActive ? 'active text-white bg-primary bg-opacity-25 border-start border-3 border-primary' : 'hover-bg-dark'}`;
    };

    const getSubNavLinkClass = (isActive: boolean) => {
        return `nav-link d-flex align-items-center py-2 px-3 text-white-50 ${isActive ? 'active text-primary fw-bold' : ''}`;
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
                            <h6 className="m-0 fw-bold">{getConfig('NOMBRE_EMPRESA', 'Empresa S.A.')}</h6>
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
                    {/* Principal Section */}
                    <small className={`text-uppercase text-white-50 fw-bold px-3 mb-2 ${isCollapsed ? 'd-none' : 'd-block'}`} style={{ fontSize: '0.7rem' }}>
                        Principal
                    </small>

                    <NavLink to="/dashboard" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Dashboard">
                        <i className="bi bi-speedometer2 fs-5"></i>
                        {!isCollapsed && <span className="ms-3">Dashboard</span>}
                    </NavLink>

                    {hasPermission('Permissions.TimeClock.Mark') && (
                        <NavLink to="/marcar-asistencia" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Marcar Asistencia">
                            <i className="bi bi-fingerprint fs-5"></i>
                            {!isCollapsed && <span className="ms-3">Marcar Asistencia</span>}
                        </NavLink>
                    )}

                    {hasPermission('Permissions.Advances.Request') && (
                        <NavLink to="/adelantos" className={({ isActive }) => getNavLinkClass(isActive)} onClick={onClose} title="Mis Adelantos">
                            <i className="bi bi-wallet2 fs-5"></i>
                            {!isCollapsed && <span className="ms-3">Mis Adelantos</span>}
                        </NavLink>
                    )}

                    {/* RRHH Collapsible Module */}
                    {showRRHH && (
                        <>
                            <div className={`my-3 border-top border-secondary mx-3 ${isCollapsed ? 'd-none' : ''}`}></div>

                            <CollapsibleSection
                                title="Recursos Humanos"
                                icon="bi-people-fill"
                                isCollapsed={isCollapsed}
                                isExpanded={expandedSections.rrhh}
                                onToggle={() => toggleSection('rrhh')}
                                basePath="/rrhh"
                            >
                                {/* Empleados Sub-Section */}
                                {hasPermission('Permissions.Employees.View') && (
                                    <CollapsibleSection
                                        title="Empleados"
                                        icon="bi-person-badge"
                                        isCollapsed={isCollapsed}
                                        isExpanded={expandedSections.empleados}
                                        onToggle={() => toggleSection('empleados')}
                                        basePath="/rrhh/empleados"
                                    >
                                        <NavLink to="/rrhh/empleados/lista" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-list-ul me-2"></i> Lista
                                        </NavLink>
                                        <NavLink to="/rrhh/empleados/cargos" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-briefcase me-2"></i> Cargos
                                        </NavLink>
                                        <NavLink to="/rrhh/empleados/roles" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-shield-lock me-2"></i> Roles
                                        </NavLink>
                                        <NavLink to="/rrhh/empleados/asignacion" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-person-check me-2"></i> Asignación
                                        </NavLink>
                                        <NavLink to="/rrhh/empleados/adelantos" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-cash-stack me-2"></i> Adelantos
                                        </NavLink>
                                    </CollapsibleSection>
                                )}

                                {/* Asistencia Sub-Section */}
                                {hasPermission('Permissions.TimeClock.ViewHistory') && (
                                    <CollapsibleSection
                                        title="Asistencia"
                                        icon="bi-clock-history"
                                        isCollapsed={isCollapsed}
                                        isExpanded={expandedSections.asistencia}
                                        onToggle={() => toggleSection('asistencia')}
                                        basePath="/rrhh/fichajes"
                                    >
                                        <NavLink to="/rrhh/fichajes" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-card-checklist me-2"></i> Registros
                                        </NavLink>
                                    </CollapsibleSection>
                                )}

                                {/* Nóminas Sub-Section */}
                                {hasPermission('Permissions.Payroll.View') && (
                                    <CollapsibleSection
                                        title="Nóminas"
                                        icon="bi-currency-dollar"
                                        isCollapsed={isCollapsed}
                                        isExpanded={expandedSections.nominas}
                                        onToggle={() => toggleSection('nominas')}
                                        basePath="/rrhh/nominas"
                                    >
                                        <NavLink to="/rrhh/nominas" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-file-earmark-text me-2"></i> Historial
                                        </NavLink>
                                        {hasPermission('Permissions.Payroll.Manage') && (
                                            <NavLink to="/rrhh/nominas/generar" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                                <i className="bi bi-plus-circle me-2"></i> Generar
                                            </NavLink>
                                        )}
                                    </CollapsibleSection>
                                )}

                                {/* Reportes Sub-Section */}
                                {hasPermission('Permissions.Reports.View') && (
                                    <CollapsibleSection
                                        title="Reportes"
                                        icon="bi-bar-chart-line"
                                        isCollapsed={isCollapsed}
                                        isExpanded={expandedSections.reportes}
                                        onToggle={() => toggleSection('reportes')}
                                        basePath="/rrhh/reportes"
                                    >
                                        <NavLink to="/rrhh/reportes" className={({ isActive }) => getSubNavLinkClass(isActive)} onClick={onClose}>
                                            <i className="bi bi-file-earmark-bar-graph me-2"></i> Ver Reportes
                                        </NavLink>
                                    </CollapsibleSection>
                                )}
                            </CollapsibleSection>
                        </>
                    )}

                    {/* Sistema Section */}
                    {hasPermission('Permissions.Settings.View') && (
                        <>
                            <div className={`my-3 border-top border-secondary mx-3 ${isCollapsed ? 'd-none' : ''}`}></div>
                            <small className={`text-uppercase text-white-50 fw-bold px-3 mb-2 ${isCollapsed ? 'd-none' : 'd-block'}`} style={{ fontSize: '0.7rem' }}>
                                Sistema
                            </small>
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
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {!isCollapsed && (
                        <div className="ms-3 overflow-hidden">
                            <div className="fw-bold text-truncate">{user?.fullName}</div>
                            <div className="text-white-50 small text-truncate">{user?.role}</div>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="mt-3 d-flex flex-column gap-2">
                        <button
                            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 btn-sm"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            <i className="bi bi-key"></i> Cambiar Clave
                        </button>

                        <button
                            className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 btn-sm"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                        </button>
                    </div>
                )}

                {isCollapsed && (
                    <div className="text-center mt-2">
                        <button onClick={handleLogout} className="btn btn-link text-white-50 p-0" title="Cerrar Sesión">
                            <i className="bi bi-box-arrow-right fs-5"></i>
                        </button>
                    </div>
                )}
            </div>
            <ChangePasswordModal
                show={showPasswordModal}
                handleClose={() => setShowPasswordModal(false)}
            />
        </div>
    );
};

export default Sidebar;
