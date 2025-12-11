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
    const { hasPermission } = useAuth();

    // Definimos la configuración de las pestañas
    const tabsConfig = [
        {
            key: 'empleados',
            title: 'Lista de Empleados',
            component: <Empleados />,
            visible: hasPermission('Permissions.Employees.View')
        },
        {
            key: 'cargos',
            title: 'Cargos (Puestos)',
            component: <Cargos />,
            visible: hasPermission('Permissions.Positions.View')
        },
        {
            key: 'roles',
            title: 'Roles (Seguridad)',
            component: <Roles />,
            visible: hasPermission('Permissions.Roles.Manage')
        },
        {
            key: 'userRoles',
            title: 'Asignación de Roles',
            component: <UserRoles />,
            visible: hasPermission('Permissions.Roles.Manage') // Or maybe a specific permission for assigning roles?
        },
        {
            key: 'adelantos',
            title: 'Solicitudes (Adelantos)',
            component: <Adelantos />,
            visible: true // All authenticated users can see their own advances
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