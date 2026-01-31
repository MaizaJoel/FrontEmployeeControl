
import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { feriadoService, Feriado } from '../../../services/feriadoService';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';

const ConfiguracionesFeriados = () => {
    const [feriados, setFeriados] = useState<Feriado[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ fecha: '', descripcion: '' });

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

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await feriadoService.getAll();
            setFeriados(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) await feriadoService.update(editingId, formData as any);
            else await feriadoService.create(formData);
            setShowModal(false);
            loadData();
            setToast({ show: true, message: 'Feriado guardado correctamente.', variant: 'success' });
        } catch (error) {
            setToast({ show: true, message: 'Error al guardar', variant: 'danger' });
        }
    };

    const handleEdit = (f: Feriado) => {
        setEditingId(f.idFeriado);
        // Ensure YYYY-MM-DD for date input
        const dateStr = f.fecha.toString().split('T')[0];
        setFormData({ fecha: dateStr, descripcion: f.descripcion });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Feriado',
            message: '¿Eliminar feriado?',
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await feriadoService.delete(id);
                    loadData();
                    setToast({ show: true, message: 'Feriado eliminado.', variant: 'success' });
                } catch (e) {
                    setToast({ show: true, message: 'Error al eliminar', variant: 'danger' });
                }
            }
        });
    };

    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" size="sm" onClick={() => { setEditingId(null); setFormData({ fecha: '', descripcion: '' }); setShowModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Feriado
                </Button>
            </div>
            {loading ? <Spinner animation="border" /> : (
                <Table hover responsive>
                    <thead className="bg-light"><tr><th>Fecha</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {feriados.map(f => (
                            <tr key={f.idFeriado}>
                                <td className="fw-bold">{new Date(f.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                                <td>{f.descripcion}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(f)} title="Editar feriado">✏️</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(f.idFeriado)} title="Eliminar feriado">🗑️</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton><Modal.Title>{editingId ? 'Editar' : 'Nuevo'} Feriado</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3"><Form.Label>Fecha</Form.Label><Form.Control type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} required /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></Modal.Footer>
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

export default ConfiguracionesFeriados;
