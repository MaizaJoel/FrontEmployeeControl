import { Nav } from 'react-bootstrap';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const EmployeeManagement = () => {
    const { hasPermission } = useAuth();

    return (
        <div className="container-fluid p-4 animate-fade-in">
            <h2 className="text-primary fw-bold mb-4">
                <i className="bi bi-people-fill me-2"></i>
                Gestión de Recursos Humanos
            </h2>

            <Nav variant="tabs" className="mb-3">
                {hasPermission('Permissions.Employees.View') && (
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="lista">
                            Lista de Empleados
                        </Nav.Link>
                    </Nav.Item>
                )}

                {hasPermission('Permissions.Positions.View') && (
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="cargos">
                            Cargos (Puestos)
                        </Nav.Link>
                    </Nav.Item>
                )}

                {hasPermission('Permissions.Roles.Manage') && (
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="roles">
                            Roles (Seguridad)
                        </Nav.Link>
                    </Nav.Item>
                )}

                {hasPermission('Permissions.Roles.Manage') && (
                    <Nav.Item>
                        <Nav.Link as={NavLink} to="asignacion">
                            Asignación de Roles
                        </Nav.Link>
                    </Nav.Item>
                )}

                {/* Visible para todos los autenticados, pero este layout está protegido por RutaAdmin usualmente. 
                    Si un admin entra aquí, ve adelantos. */}
                <Nav.Item>
                    <Nav.Link as={NavLink} to="adelantos">
                        Solicitudes (Adelantos)
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            <div className="bg-white p-3 border border-top-0 rounded-bottom shadow-sm" style={{ minHeight: '500px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default EmployeeManagement;