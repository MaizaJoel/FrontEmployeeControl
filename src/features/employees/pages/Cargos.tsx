import { useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { cargoService } from '../../../services/cargoService';
import { Cargo } from '../../../types';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';

import { useAuth } from '../../../context/AuthContext';

const Cargos = () => {
    const { hasPermission } = useAuth();
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado del Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Formulario
    const [formData, setFormData] = useState({
        nombreCargo: '',
        descripcion: '',
        salarioBase: 0
    });

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

    // Cargar datos al inicio
    useEffect(() => {
        loadCargos();
    }, []);

    const loadCargos = async () => {
        setLoading(true);
        try {
            const data = await cargoService.getAll();
            setCargos(data);
            setError('');
        } catch (err) {
            setError('Error al cargar los cargos. ¿El backend está corriendo?');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal para Crear
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ nombreCargo: '', descripcion: '', salarioBase: 0 });
        setShowModal(true);
    };

    // Abrir modal para Editar
    const handleOpenEdit = (cargo: Cargo) => {
        setEditingId(cargo.idCargo);
        setFormData({
            nombreCargo: cargo.nombreCargo,
            descripcion: cargo.descripcion || '',
            salarioBase: cargo.salarioBase
        });
        setShowModal(true);
    };

    // Guardar (Crear o Editar)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await cargoService.update(editingId, formData);
            } else {
                await cargoService.create(formData);
            }
            setShowModal(false);
            loadCargos();
            setToast({ show: true, message: 'Cargo guardado correctamente.', variant: 'success' });
        } catch (err) {
            setToast({ show: true, message: 'Error al guardar. Revisa la consola.', variant: 'danger' });
            console.error(err);
        }
    };

    // Eliminar
    const handleDelete = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Cargo',
            message: '¿Seguro que deseas eliminar este cargo?',
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await cargoService.delete(id);
                    loadCargos();
                    setToast({ show: true, message: 'Cargo eliminado correctamente.', variant: 'success' });
                } catch (err) {
                    setToast({ show: true, message: 'Error al eliminar. Puede que esté asignado a un empleado.', variant: 'danger' });
                }
            }
        });
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-end mb-4">
                {hasPermission('Permissions.Positions.Manage') && (
                    <Button variant="primary" onClick={handleOpenCreate}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                        Nuevo Cargo
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <div className="card shadow-sm">
                    <Table hover responsive className="mb-0 table-nowrap">
                        <thead className="table-light">
                            <tr>
                                <th>Cargo</th>
                                <th>Descripción</th>
                                <th>Salario Base</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargos.map((cargo) => (
                                <tr key={cargo.idCargo}>
                                    <td className="fw-bold">{cargo.nombreCargo}</td>
                                    <td>{cargo.descripcion || '-'}</td>
                                    <td>${cargo.salarioBase.toFixed(2)}</td>
                                    <td className="text-end">
                                        {hasPermission('Permissions.Positions.Manage') && (
                                            <>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    title="Editar Cargo"
                                                    onClick={() => handleOpenEdit(cargo)}
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    title="Eliminar Cargo"
                                                    onClick={() => handleDelete(cargo.idCargo)}
                                                >
                                                    🗑️
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {cargos.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-muted">
                                        No hay cargos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modal de Formulario */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingId ? 'Editar Cargo' : 'Nuevo Cargo'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Cargo *</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.nombreCargo}
                                onChange={(e) => setFormData({ ...formData, nombreCargo: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Salario Base ($) *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                required
                                value={formData.salarioBase}
                                onChange={(e) => setFormData({ ...formData, salarioBase: parseFloat(e.target.value) })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

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

export default Cargos;