import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Badge, Form } from 'react-bootstrap';
import { roleService, Role, UserWithRoles } from '../../../services/roleService';

const UserRoles = () => {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [roles, setRoles] = useState<Role[]>([]); // Lista de roles disponibles
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                roleService.getUsers(),
                roleService.getAll()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error(error);
            alert('Error al cargar datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, roleName: string, hasRole: boolean) => {
        try {
            if (hasRole) {
                // Si ya lo tiene, lo quitamos
                if (!confirm(`¿Quitar rol ${roleName}?`)) return;
                await roleService.removeRole(userId, roleName);
            } else {
                // Si no lo tiene, lo asignamos
                await roleService.assignRole(userId, roleName);
            }
            // Recargar datos para ver cambios
            const updatedUsers = await roleService.getUsers();
            setUsers(updatedUsers);
        } catch (err: any) {
            alert(err.response?.data || 'Error al cambiar rol.');
        }
    };

    return (
        <div className="animate-fade-in">
            <h5 className="mb-3 text-muted">Asignación de Permisos a Usuarios</h5>

            {loading ? <Spinner animation="border" /> : (
                <div className="card shadow-sm border-0">
                    <Table hover responsive className="mb-0 align-middle table-nowrap">
                        <thead className="bg-light">
                            <tr>
                                <th>Usuario / Email</th>
                                <th>Roles Actuales</th>
                                {roles.map(r => (
                                    <th key={r.id} className="text-center" style={{ minWidth: '100px' }}>
                                        {r.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="fw-bold">{u.userName}</div>
                                        <small className="text-muted">{u.email}</small>
                                    </td>
                                    <td>
                                        {u.roles.map(r => (
                                            <Badge key={r} bg="info" className="me-1 text-dark">{r}</Badge>
                                        ))}
                                    </td>
                                    {/* Checkboxes dinámicos por cada Rol */}
                                    {roles.map(r => {
                                        const hasRole = u.roles.includes(r.name);
                                        return (
                                            <td key={r.id} className="text-center">
                                                <Form.Check
                                                    type="switch"
                                                    checked={hasRole}
                                                    onChange={() => handleRoleChange(u.id, r.name, hasRole)}
                                                // Deshabilitar quitarse admin a uno mismo (opcional, el backend ya protege)
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default UserRoles;