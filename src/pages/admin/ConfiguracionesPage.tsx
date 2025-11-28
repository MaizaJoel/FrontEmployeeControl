import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { configuracionService, Configuracion } from '../../services/configuracionService';
import { feriadoService, Feriado } from '../../services/feriadoService';

const ConfiguracionesPage = () => {
    return (
        <div className="container-fluid p-4 animate-fade-in">
            <h2 className="text-primary fw-bold mb-4">
                <i className="bi bi-gear me-2"></i>
                Configuraciones del Sistema
            </h2>
            
            <Tabs defaultActiveKey="general" id="config-tabs" className="mb-3">
                <Tab eventKey="general" title="Variables Generales">
                    <ConfiguracionesTab />
                </Tab>
                <Tab eventKey="feriados" title="Feriados">
                    <FeriadosTab />
                </Tab>
            </Tabs>
        </div>
    );
};

const ConfiguracionesTab = () => {
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
            if (editingId) await configuracionService.update(editingId, formData);
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
                <Button variant="primary" size="sm" onClick={() => { setEditingId(null); setFormData({clave:'', valor:'', descripcion:''}); setShowModal(true); }}>
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
                                    <Button variant="link" size="sm" onClick={() => handleEdit(c)}><i className="bi bi-pencil"></i></Button>
                                    <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(c.idConfiguracion)}><i className="bi bi-trash"></i></Button>
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
                        <Form.Group className="mb-3"><Form.Label>Clave</Form.Label><Form.Control value={formData.clave} onChange={e => setFormData({...formData, clave: e.target.value})} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Valor</Form.Label><Form.Control value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

const FeriadosTab = () => {
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
        setFormData({ fecha: f.fecha.toString(), descripcion: f.descripcion });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar feriado?')) return;
        try { await feriadoService.delete(id); loadData(); } catch (e) { alert('Error'); }
    };

    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" size="sm" onClick={() => { setEditingId(null); setFormData({fecha:'', descripcion:''}); setShowModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Feriado
                </Button>
            </div>
            {loading ? <Spinner animation="border" /> : (
                <Table hover responsive>
                    <thead className="bg-light"><tr><th>Fecha</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {feriados.map(f => (
                            <tr key={f.idFeriado}>
                                <td className="fw-bold">{new Date(f.fecha).toLocaleDateString()}</td>
                                <td>{f.descripcion}</td>
                                <td>
                                    <Button variant="link" size="sm" onClick={() => handleEdit(f)}><i className="bi bi-pencil"></i></Button>
                                    <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(f.idFeriado)}><i className="bi bi-trash"></i></Button>
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
                        <Form.Group className="mb-3"><Form.Label>Fecha</Form.Label><Form.Control type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ConfiguracionesPage;