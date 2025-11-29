import { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import Empleados from './Empleados';
import Cargos from './Cargos';
import Roles from './Roles';
import UserRoles from './UserRoles';
import Adelantos from './Adelantos';
import { useAuth } from '../../context/AuthContext';

const EmployeeManagement = () => {
    const [key, setKey] = useState('empleados');
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    // Definimos la configuración de las pestañas
    const tabsConfig = [
        {
            key: 'empleados',
            title: 'Lista de Empleados',
            component: <Empleados />,
            visible: true // Siempre visible
        },
        {
            key: 'cargos',
            title: 'Cargos (Puestos)',
            component: <Cargos />,
            visible: isAdmin // Solo Admin
        },
        {
            key: 'roles',
            title: 'Roles (Seguridad)',
            component: <Roles />,
            visible: isAdmin
        },
        {
            key: 'userRoles',
            title: 'Asignación de Roles',
            component: <UserRoles />,
            visible: isAdmin
        },
        {
            key: 'adelantos',
            title: 'Solicitudes (Adelantos)',
            component: <Adelantos />,
            visible: true
        }
    ];

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
                {/* Renderizamos dinámicamente filtrando los visibles */}
                {tabsConfig
                    .filter(tab => tab.visible)
                    .map(tab => (
                        <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                            {tab.component}
                        </Tab>
                    ))
                }
            </Tabs>
        </div>
    );
};

export default EmployeeManagement;