import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useConfig } from '../../../context/ConfigContext';

const MainLayout = () => {
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const { getConfig } = useConfig();

    const sidebarWidth = isCollapsed ? '80px' : '280px';

    return (
        <div className="d-flex w-100" style={{ minHeight: '100vh', overflow: 'hidden' }}>

            {/* 1. SIDEBAR DE ESCRITORIO */}
            <div className="d-none d-md-block transition-all"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: sidebarWidth,
                    zIndex: 1000,
                    transition: 'width 0.3s ease'
                }}>
                <div style={{ overflow: 'hidden', height: '100%' }}>
                    <Sidebar isCollapsed={isCollapsed} />
                </div>
            </div>

            {/* 2. ÁREA PRINCIPAL */}
            <div className="d-flex flex-column flex-grow-1 w-100" style={{ marginLeft: 0 }}>
                <style>
                    {`
                        @media (min-width: 768px) {
                            .main-content-wrapper {
                                margin-left: ${sidebarWidth} !important;
                                transition: margin-left 0.3s ease;
                            }
                        }
                    `}
                </style>
                <div className="d-flex flex-column flex-grow-1 main-content-wrapper">

                    {/* HEADER / TOGGLE BAR FOR DESKTOP */}
                    <div className="d-none d-md-flex align-items-center bg-white border-bottom px-4 py-2 sticky-top" style={{ height: '60px', zIndex: 900 }}>
                        <button
                            className="btn btn-link text-dark p-0 me-3"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                        >
                            <i className={`bi ${isCollapsed ? 'bi-list' : 'bi-list-nested'} fs-4`}></i>
                        </button>
                        <h5 className="m-0 text-muted">Sistema de Gestión</h5>
                    </div>

                    {/* BARRA SUPERIOR MÓVIL */}
                    <div className="d-md-none bg-dark text-white p-3 d-flex justify-content-between align-items-center shadow sticky-top">
                        <span className="fw-bold fs-5">{getConfig('NOMBRE_EMPRESA', 'RRHH System')}</span>
                        <button
                            className="btn btn-outline-light btn-sm border-1 d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                            onClick={() => setShowMobileMenu(true)}
                        >
                            <i className="bi bi-list fs-3"></i>
                        </button>
                    </div>

                    {/* CONTENIDO DE LA PÁGINA */}
                    <main className="flex-grow-1 p-4 bg-light" style={{ overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* 3. SIDEBAR MÓVIL */}
            {showMobileMenu && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 animate-fade-in"
                    style={{
                        zIndex: 1050,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setShowMobileMenu(false)}
                >
                    <div
                        className="bg-dark h-100 shadow-lg animate-slide-in"
                        style={{ width: '280px', maxWidth: '80%' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Sidebar onClose={() => setShowMobileMenu(false)} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default MainLayout;
