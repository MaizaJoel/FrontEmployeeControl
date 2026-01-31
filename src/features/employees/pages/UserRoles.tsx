import { useEffect, useState } from 'react';
import { Table, Spinner, Badge, Form } from 'react-bootstrap';
import { roleService, Role, UserWithRoles } from '../../../services/roleService';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';
import { getRoleDisplayName } from '../../../utils/textUtils';

const UserRoles = () => {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [roles, setRoles] = useState<Role[]>([]); // Lista de roles disponibles
    const [loading, setLoading] = useState(false);

    // Estado para ConfirmModal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', variant: 'warning', onConfirm: () => { } });

    // Estado para Toast
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

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
            setToast({ show: true, message: 'Error al cargar datos.', variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (userId: string, roleName: string, hasRole: boolean) => {
        if (hasRole) {
            // Si ya lo tiene, confirmar antes de quitar
            setConfirmModal({
                show: true,
                title: 'Quitar Rol',
                message: `¿Quitar rol ${getRoleDisplayName(roleName)}?`,
                variant: 'warning',
                onConfirm: async () => {
                    setConfirmModal(prev => ({ ...prev, show: false }));
                    try {
                        await roleService.removeRole(userId, roleName);
                        const updatedUsers = await roleService.getUsers();
                        setUsers(updatedUsers);
                        setToast({ show: true, message: `Rol ${getRoleDisplayName(roleName)} removido.`, variant: 'success' });
                    } catch (err: any) {
                        setToast({ show: true, message: err.response?.data || 'Error al cambiar rol.', variant: 'danger' });
                    }
                }
            });
        } else {
            // Si no lo tiene, asignar directamente
            (async () => {
                try {
                    await roleService.assignRole(userId, roleName);
                    const updatedUsers = await roleService.getUsers();
                    setUsers(updatedUsers);
                    setToast({ show: true, message: `Rol ${getRoleDisplayName(roleName)} asignado.`, variant: 'success' });
                } catch (err: any) {
                    setToast({ show: true, message: err.response?.data || 'Error al cambiar rol.', variant: 'danger' });
                }
            })();
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
                                        {getRoleDisplayName(r.name)}
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
                                            <Badge key={r} bg="info" className="me-1 text-dark">{getRoleDisplayName(r)}</Badge>
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

            {/* Modal de confirmación */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />

            {/* Toast para mensajes */}
            <Toast
                show={toast.show}
                message={toast.message}
                variant={toast.variant}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default UserRoles;