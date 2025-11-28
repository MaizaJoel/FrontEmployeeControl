import { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import Empleados from './Empleados';
import Cargos from './Cargos';
import Roles from './Roles';
import Adelantos from './Adelantos';
import { useAuth } from '../../context/AuthContext';

const EmployeeManagement = () => {
    const [key, setKey] = useState('empleados');
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    return (
        <div className="container-fluid p-4 animate-fade-in">
            <h2 className="text-primary fw-bold mb-4">
                <i className="bi bi-people-fill me-2"></i>
                Gestión de Recursos Humanos
            </h2>

            <Tabs
                id="employee-management-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k || 'empleados')}
                className="mb-3"
            >
                <Tab eventKey="empleados" title="Lista de Empleados">
                    <Empleados />
                </Tab>
                
                {isAdmin && (
                    <Tab eventKey="cargos" title="Cargos (Puestos)">
                        <Cargos />
                    </Tab>
                )}

                {isAdmin && (
                    <Tab eventKey="roles" title="Roles (Seguridad)">
                        <Roles />
                    </Tab>
                )}

                <Tab eventKey="adelantos" title="Solicitudes (Adelantos)">
                    <Adelantos />
                </Tab>
            </Tabs>
        </div>
    );
};

export default EmployeeManagement;