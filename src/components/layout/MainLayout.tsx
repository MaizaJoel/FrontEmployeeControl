import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

    return (
        <div className="d-flex w-100" style={{ minHeight: '100vh', overflow: 'hidden' }}>

            {/* 1. SIDEBAR DE ESCRITORIO (Oculto en celular 'd-none', visible en md 'd-md-block') */}
            <div className="d-none d-md-block" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', zIndex: 1000 }}>
                <Sidebar />
            </div>

            {/* 2. ÁREA PRINCIPAL (Ocupa todo el ancho, con margen a la izquierda en desktop) */}
            <div className="d-flex flex-column flex-grow-1 w-100" style={{ marginLeft: showMobileMenu ? 0 : 0 }}>
                {/* Note: We use a CSS media query class or inline style for the margin. 
                    Since we can't easily use media queries in inline styles, we'll use a responsive utility or style block. 
                    Actually, let's just use a style tag or class. 
                */}
                <style>
                    {`
                        @media (min-width: 768px) {
                            .main-content-wrapper {
                                margin-left: 280px !important;
                            }
                        }
                    `}
                </style>
                <div className="d-flex flex-column flex-grow-1 w-100 main-content-wrapper">

                    {/* BARRA SUPERIOR MÓVIL (Solo visible en celular 'd-md-none') */}
                    <div className="d-md-none bg-dark text-white p-3 d-flex justify-content-between align-items-center shadow sticky-top">
                        <span className="fw-bold fs-5">RRHH System</span>
                        <button
                            className="btn btn-outline-light btn-sm"
                            onClick={() => setShowMobileMenu(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                            </svg>
                        </button>
                    </div>

                    {/* CONTENIDO DE LA PÁGINA (Outlet) */}
                    <main className="flex-grow-1 p-4 bg-light" style={{ overflowY: 'auto', minHeight: '100vh' }}>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* 3. SIDEBAR MÓVIL (Offcanvas / Overlay) */}
            {showMobileMenu && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 animate-fade-in"
                    style={{
                        zIndex: 1050,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setShowMobileMenu(false)} // Clic afuera para cerrar
                >
                    <div
                        className="bg-dark h-100 shadow-lg animate-slide-in"
                        style={{ width: '280px', maxWidth: '80%' }}
                        onClick={(e) => e.stopPropagation()} // Evitar cierre al hacer clic adentro
                    >
                        <Sidebar onClose={() => setShowMobileMenu(false)} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default MainLayout;
