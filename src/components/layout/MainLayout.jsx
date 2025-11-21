import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <div className="d-flex w-100" style={{ minHeight: '100vh', overflow: 'hidden' }}>

            {/* 1. SIDEBAR DE ESCRITORIO (Oculto en celular 'd-none', visible en md 'd-md-block') */}
            <div className="d-none d-md-block bg-dark">
                <Sidebar isMobile={false} />
            </div>

            {/* 2. ÁREA PRINCIPAL (Ocupa todo el ancho) */}
            <div className="d-flex flex-column flex-grow-1 w-100">

                {/* BARRA SUPERIOR MÓVIL (Solo visible en celular 'd-md-none') */}
                <div className="d-md-none bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5">RRHH System</span>
                    <button
                        className="btn btn-outline-light"
                        onClick={() => setShowMobileMenu(true)}
                    >
                        ☰ Menú
                    </button>
                </div>

                {/* CONTENIDO DE LA PÁGINA (Outlet) */}
                <main className="flex-grow-1 p-4 bg-light" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
                    <Outlet />
                </main>
            </div>

            {/* 3. SIDEBAR MÓVIL (Offcanvas / Overlay) */}
            {showMobileMenu && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowMobileMenu(false)} // Clic afuera para cerrar
                >
                    <div
                        className="bg-dark h-100 shadow"
                        style={{ width: '280px', maxWidth: '80%' }}
                        onClick={(e) => e.stopPropagation()} // Evitar cierre al hacer clic adentro
                    >
                        <Sidebar isMobile={true} closeMobileMenu={() => setShowMobileMenu(false)} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default MainLayout;