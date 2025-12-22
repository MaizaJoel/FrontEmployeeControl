import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { configuracionService, Configuracion } from '../../../services/configuracionService';

const ConfiguracionesGeneral = () => {
    const [configs, setConfigs] = useState<Configuracion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ clave: '', valor: '', descripcion: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await configuracionService.getAll();
            setConfigs(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) await configuracionService.update(editingId, { ...formData, idConfiguracion: editingId });
            else await configuracionService.create(formData);
            setShowModal(false);
            loadData();
        } catch (error) { alert('Error al guardar'); }
    };

    const handleEdit = (c: Configuracion) => {
        setEditingId(c.idConfiguracion);
        setFormData({ clave: c.clave, valor: c.valor, descripcion: c.descripcion || '' });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar configuración?')) return;
        try { await configuracionService.delete(id); loadData(); } catch (e) { alert('Error'); }
    };

    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" size="sm" onClick={() => { setEditingId(null); setFormData({ clave: '', valor: '', descripcion: '' }); setShowModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i> Nueva Variable
                </Button>
            </div>
            {loading ? <Spinner animation="border" /> : (
                <Table hover responsive>
                    <thead className="bg-light"><tr><th>Clave</th><th>Valor</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {configs.map(c => (
                            <tr key={c.idConfiguracion}>
                                <td className="fw-bold">{c.clave}</td>
                                <td>{c.valor}</td>
                                <td className="text-muted">{c.descripcion}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(c)} title="Editar configuración">✏️</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.idConfiguracion)} title="Eliminar configuración">🗑️</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton><Modal.Title>{editingId ? 'Editar' : 'Nueva'} Configuración</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3"><Form.Label>Clave</Form.Label><Form.Control value={formData.clave} onChange={e => setFormData({ ...formData, clave: e.target.value })} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Valor</Form.Label><Form.Control value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ConfiguracionesGeneral;
