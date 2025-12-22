import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { feriadoService, Feriado } from '../../../services/feriadoService';

const ConfiguracionesFeriados = () => {
    const [feriados, setFeriados] = useState<Feriado[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ fecha: '', descripcion: '' });

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
        } catch (error) { alert('Error al guardar'); }
    };

    const handleEdit = (f: Feriado) => {
        setEditingId(f.idFeriado);
        // Ensure YYYY-MM-DD for date input
        const dateStr = f.fecha.toString().split('T')[0];
        setFormData({ fecha: dateStr, descripcion: f.descripcion });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar feriado?')) return;
        try { await feriadoService.delete(id); loadData(); } catch (e) { alert('Error'); }
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
        </div>
    );
};

export default ConfiguracionesFeriados;
