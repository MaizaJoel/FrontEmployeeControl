import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { roleService, PermissionCheckbox } from '../../../../services/roleService';
import Toast from '../../../../shared/components/ui/Toast';

interface Props {
    show: boolean;
    handleClose: () => void;
    roleId: string | null;
    roleName: string;
}

const PermissionsModal = ({ show, handleClose, roleId, roleName }: Props) => {
    const [permissions, setPermissions] = useState<PermissionCheckbox[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Estado para Toast
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

    // Cargar permisos cuando se abre el modal
    useEffect(() => {
        if (show && roleId) {
            loadPermissions(roleId);
        }
    }, [show, roleId]);

    const loadPermissions = async (id: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await roleService.getPermissions(id);
            setPermissions(data.permissions);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los permisos.');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (permValue: string) => {
        setPermissions(prev => prev.map(p =>
            p.value === permValue ? { ...p, isSelected: !p.isSelected } : p
        ));
    };

    const handleSave = async () => {
        if (!roleId) return;
        setSaving(true);
        setError('');

        try {
            // Filtramos solo los marcados
            const selected = permissions
                .filter(p => p.isSelected)
                .map(p => p.value);

            await roleService.updatePermissions(roleId, selected);

            // Mostrar toast de éxito y cerrar modal
            setToast({ show: true, message: 'Permisos actualizados correctamente', variant: 'success' });
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err) {
            setError('Error al guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    // Helper para hacer legible el nombre del permiso (ej. "Permisos.Empleados.Ver" -> "Empleados Ver")
    const formatLabel = (val: string) => {
        return val.replace('Permisos.', '').replace(/\./g, ' ');
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Permisos para: <span className="text-primary">{roleName}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : (
                        <div className="container-fluid">
                            {/* Agrupamos visualmente si quisieras, por ahora lista simple en grid */}
                            <Row>
                                {permissions.map(p => (
                                    <Col md={6} key={p.value} className="mb-2">
                                        <Form.Check
                                            type="switch"
                                            id={`perm-${p.value}`}
                                            label={formatLabel(p.value)}
                                            checked={p.isSelected}
                                            onChange={() => togglePermission(p.value)}
                                            className={p.isSelected ? "fw-bold text-success" : "text-muted"}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={loading || saving}>
                        {saving ? <Spinner size="sm" animation="border" /> : 'Guardar Permisos'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast para mensajes */}
            <Toast
                show={toast.show}
                message={toast.message}
                variant={toast.variant}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    );
};

export default PermissionsModal;