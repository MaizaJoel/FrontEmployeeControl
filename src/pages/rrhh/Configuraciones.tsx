import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';

// Interface for Configuration
interface Configuracion {
    idConfiguracion: number;
    clave: string;
    valor: string;
    descripcion?: string;
}

const Configuraciones = () => {
    // Mock data for now
    const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Configuracion>({
        idConfiguracion: 0,
        clave: '',
        valor: '',
        descripcion: ''
    });

    useEffect(() => {
        loadConfiguraciones();
    }, []);

    const loadConfiguraciones = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setConfiguraciones([
                { idConfiguracion: 1, clave: 'EMPRESA_NOMBRE', valor: 'Mi Empresa S.A.', descripcion: 'Nombre legal de la empresa' },
                { idConfiguracion: 2, clave: 'HORA_ENTRADA', valor: '08:00', descripcion: 'Hora de entrada por defecto' },
                { idConfiguracion: 3, clave: 'HORA_SALIDA', valor: '17:00', descripcion: 'Hora de salida por defecto' }
            ]);
            setLoading(false);
        }, 500);
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ idConfiguracion: 0, clave: '', valor: '', descripcion: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (config: Configuracion) => {
        setEditingId(config.idConfiguracion);
        setFormData(config);
        setShowModal(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            // Update logic
            setConfiguraciones(prev => prev.map(c => c.idConfiguracion === editingId ? formData : c));
        } else {
            // Create logic
            setConfiguraciones(prev => [...prev, { ...formData, idConfiguracion: Date.now() }]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Seguro que deseas eliminar esta configuración?')) {
            setConfiguraciones(prev => prev.filter(c => c.idConfiguracion !== id));
        }
    };

    return (
        <div className="container mt-4 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Configuraciones del Sistema</h2>
                <Button variant="primary" onClick={handleOpenCreate}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    Nueva Configuración
                </Button>
            </div>

            {/* {error && <Alert variant="danger">{error}</Alert>} */}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                <div className="card shadow-sm border-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Clave</th>
                                <th>Valor</th>
                                <th>Descripción</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configuraciones.map((config) => (
                                <tr key={config.idConfiguracion}>
                                    <td className="fw-bold text-primary">{config.clave}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border px-3 py-2">
                                            {config.valor}
                                        </span>
                                    </td>
                                    <td className="text-muted">{config.descripcion || '-'}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleOpenEdit(config)}
                                        >✏️</Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(config.idConfiguracion)}
                                        >🗑️</Button>
                                    </td>
                                </tr>
                            ))}
                            {configuraciones.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-5 text-muted">
                                        No hay configuraciones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold">{editingId ? 'Editar Configuración' : 'Nueva Configuración'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="warning" className="small">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Cambiar estos valores puede afectar el funcionamiento del sistema.
                        </Alert>
                        <Form.Group className="mb-3">
                            <Form.Label>Clave (Identificador) *</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                placeholder="Ej: EMPRESA_NOMBRE"
                                value={formData.clave}
                                onChange={(e) => setFormData({ ...formData, clave: e.target.value.toUpperCase() })}
                                disabled={!!editingId} // Prevent changing key on edit
                            />
                            <Form.Text className="text-muted">Debe ser único y en mayúsculas.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valor *</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                placeholder="Valor de la configuración"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Para qué sirve esta configuración..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Guardar Cambios
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Configuraciones;
