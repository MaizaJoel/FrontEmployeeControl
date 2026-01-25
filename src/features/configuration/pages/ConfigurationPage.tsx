import { Nav } from 'react-bootstrap';
import { Outlet, NavLink } from 'react-router-dom';

const ConfiguracionesPage = () => {
    // Utility: If exact match /configuraciones, redirect to /general?
    // Handled in App.tsx typically, but safe checking in layout also works.

    // We determine active key for highlighting if needed, but NavLink handles it automatically with `as={NavLink}` usually.
    // However, Bootstrap Nav.Link + Router NavLink sometimes needs active prop explicit or styling.
    // Let's use standard NavLink inside Nav.Link or just Nav.Link with as={NavLink}.

    return (
        <div className="container-fluid p-4 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold mb-0">
                    <i className="bi bi-gear me-2"></i>
                    Configuraciones del Sistema
                </h2>
            </div>

            <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                    {/* Note: 'end' prop ensures exact matching if needed, but for 'general' we want /configuraciones/general */}
                    <Nav.Link as={NavLink} to="general">
                        Variables Generales
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="feriados">
                        Feriados
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="tasas">
                        Tasas y Horarios
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="email">
                        Configuración Email
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            <div className="bg-white p-3 border border-top-0 rounded-bottom shadow-sm" style={{ minHeight: '400px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default ConfiguracionesPage;