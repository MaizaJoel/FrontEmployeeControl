import { useEffect, useState } from 'react';
import { Button, Table, Alert, Spinner } from 'react-bootstrap';
import { roleService, Role } from '../../../services/roleService';
import RoleModal from '../components/roles/RoleModal';
import { getRoleDisplayName } from '../../../utils/textUtils';
import PermissionsModal from '../components/roles/PermissionsModal';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';
import NotificationModal from '../../../shared/components/ui/NotificationModal';

const Roles = () => {
    const { hasPermission } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado: Crear Rol
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Estado: Gestionar Permisos
    const [showPermisosModal, setShowPermisosModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<{ id: string, name: string } | null>(null);

    // Estado para ConfirmModal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', variant: 'danger', onConfirm: () => { } });

    // Estado para Toast
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

    // Estado para NotificationModal
    const [notification, setNotification] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'success' | 'danger' | 'warning' | 'info';
    }>({ show: false, title: '', message: '', variant: 'warning' });

    useEffect(() => { loadRoles(); }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await roleService.getAll();
            setRoles(data);
            setError('');
        } catch (err) {
            setError('Error al cargar roles.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: { name: string }) => {
        try {
            await roleService.create(data);
            setShowCreateModal(false);
            loadRoles();
            setToast({ show: true, message: 'Rol creado correctamente.', variant: 'success' });
        } catch (err: any) {
            setToast({ show: true, message: 'Error al crear: ' + (err.response?.data || err.message), variant: 'danger' });
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (name === 'Admin' || name === 'Employee') {
            setNotification({
                show: true,
                title: 'Acción No Permitida',
                message: 'No se pueden eliminar los roles del sistema.',
                variant: 'warning'
            });
            return;
        }

        setConfirmModal({
            show: true,
            title: 'Eliminar Rol',
            message: `¿Eliminar rol ${getRoleDisplayName(name)}?`,
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await roleService.delete(id);
                    loadRoles();
                    setToast({ show: true, message: 'Rol eliminado correctamente.', variant: 'success' });
                } catch (err) {
                    setToast({ show: true, message: 'Error al eliminar rol.', variant: 'danger' });
                }
            }
        });
    };

    const handleOpenPermisos = (role: Role) => {
        setSelectedRole({ id: role.id, name: role.name });
        setShowPermisosModal(true);
    };

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-muted mb-0">Definición de Roles</h5>
                {hasPermission('Permissions.Roles.Manage') && (
                    <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i> Nuevo Rol
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                <div className="card shadow-sm border-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((r) => (
                                <tr key={r.id}>
                                    <td><small className="text-muted text-truncate d-block" style={{ maxWidth: '150px' }}>{r.id}</small></td>
                                    <td className="fw-bold">{getRoleDisplayName(r.name)}</td>
                                    <td className="text-end">
                                        {/* Botón Permisos */}
                                        {hasPermission('Permissions.Roles.Manage') && (
                                            <Button variant="link" size="sm" className="me-2"
                                                onClick={() => handleOpenPermisos(r)}
                                                title="Configurar Permisos"
                                            >
                                                <i className="bi bi-shield-check"></i> Permisos
                                            </Button>
                                        )}

                                        {/* Botón Eliminar */}
                                        {hasPermission('Permissions.Roles.Manage') && (
                                            <Button variant="link" className="text-danger p-0"
                                                onClick={() => handleDelete(r.id, r.name)}
                                                disabled={r.name === 'Admin' || r.name === 'Employee'}
                                                title="Eliminar Rol"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* MODAL DE CREACIÓN */}
            <RoleModal
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                handleSave={handleCreate}
            />

            {/* MODAL DE PERMISOS */}
            <PermissionsModal
                show={showPermisosModal}
                handleClose={() => setShowPermisosModal(false)}
                roleId={selectedRole?.id || null}
                roleName={selectedRole?.name || ''}
            />

            {/* Modal de confirmación */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />

            {/* Modal notificación */}
            <NotificationModal
                show={notification.show}
                title={notification.title}
                message={notification.message}
                variant={notification.variant}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
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

export default Roles;