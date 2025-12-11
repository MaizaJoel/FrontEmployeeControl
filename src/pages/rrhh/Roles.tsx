import { useEffect, useState } from 'react';
import { Button, Table, Alert, Spinner } from 'react-bootstrap';
import { roleService, Role } from '../../services/roleService';
import RoleModal from '../../components/roles/RoleModal';
import PermissionsModal from '../../components/roles/PermissionsModal';

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado: Crear Rol
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Estado: Gestionar Permisos
    const [showPermisosModal, setShowPermisosModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<{ id: string, name: string } | null>(null);

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
        } catch (err: any) {
            alert('Error al crear: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (name === 'Admin' || name === 'Employee') {
            alert('No se pueden eliminar los roles del sistema.');
            return;
        }
        if (!confirm(`¿Eliminar rol ${name}?`)) return;

        try {
            await roleService.delete(id);
            loadRoles();
        } catch (err) {
            alert('Error al eliminar rol.');
        }
    };

    const handleOpenPermisos = (role: Role) => {
        setSelectedRole({ id: role.id, name: role.name });
        setShowPermisosModal(true);
    };

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-muted mb-0">Definición de Roles</h5>
                <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Rol
                </Button>
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
                                    <td className="fw-bold">{r.name}</td>
                                    <td className="text-end">
                                        {/* Botón Permisos */}
                                        <Button variant="link" size="sm" className="me-2"
                                            onClick={() => handleOpenPermisos(r)}
                                            title="Configurar Permisos"
                                        >
                                            <i className="bi bi-shield-check"></i> Permisos
                                        </Button>

                                        {/* Botón Eliminar */}
                                        <Button variant="link" className="text-danger p-0"
                                            onClick={() => handleDelete(r.id, r.name)}
                                            disabled={r.name === 'Admin' || r.name === 'Employee'}
                                            title="Eliminar Rol"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
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
        </div>
    );
};

export default Roles;