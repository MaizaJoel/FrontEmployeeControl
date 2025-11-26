import { useEffect, useState } from 'react';
import { Table, Spinner, Badge, Card, Alert, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { fichajeService, FichajeLog } from '../../services/fichajeService';
import { empleadoService } from '../../services/empleadoService';
import { Empleado } from '../../types';

const Fichajes = () => {
    // Datos
    const [fichajes, setFichajes] = useState<FichajeLog[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    // Filtros
    const [filtroEmpleado, setFiltroEmpleado] = useState<number>(0);
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]); // Hoy
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

    // UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Edición/Creación
    const [editingFichaje, setEditingFichaje] = useState<FichajeLog | null>(null);
    const [formFecha, setFormFecha] = useState('');
    const [formHora, setFormHora] = useState('');
    const [formTipo, setFormTipo] = useState('ENTRADA');
    const [formIdEmpleado, setFormIdEmpleado] = useState(0);

    useEffect(() => {
        loadMaestros();
        loadData(); // Cargar inicial
    }, []);

    const loadMaestros = async () => {
        try {
            const emps = await empleadoService.getAll();
            setEmpleados(emps);
        } catch (e) { console.error(e); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fichajeService.getAll(
                filtroEmpleado === 0 ? undefined : filtroEmpleado,
                fechaInicio,
                fechaFin
            );
            setFichajes(data);
            setError('');
        } catch (err) {
            setError('Error al cargar historial.');
        } finally {
            setLoading(false);
        }
    };

    // --- MODAL HANDLERS ---
    const handleOpenCreate = () => {
        setEditingFichaje(null);
        setFormIdEmpleado(filtroEmpleado || (empleados[0]?.idEmpleado || 0));
        const now = new Date();
        setFormFecha(now.toISOString().split('T')[0]);
        setFormHora(now.toTimeString().slice(0, 5));
        setFormTipo('ENTRADA');
        setShowModal(true);
    };

    const handleOpenEdit = (log: FichajeLog) => {
        setEditingFichaje(log);
        setFormIdEmpleado(log.idEmpleado);

        const dt = new Date(log.timestampUtc);
        setFormFecha(dt.toLocaleDateString('en-CA')); // YYYY-MM-DD local
        setFormHora(dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })); // HH:mm
        setFormTipo(log.tipoEvento);
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const fechaHoraLocal = new Date(`${formFecha}T${formHora}:00`).toISOString();
            const payload = {
                idEmpleado: formIdEmpleado,
                fechaHoraLocal: fechaHoraLocal,
                tipoEvento: formTipo
            };

            if (editingFichaje) {
                await fichajeService.update(editingFichaje.idFichaje, payload);
            } else {
                await fichajeService.createManual(payload);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            alert('Error al guardar.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este registro?")) return;
        try {
            await fichajeService.delete(id);
            loadData();
        } catch (e) { alert("Error al eliminar"); }
    };

    // --- RENDER ---
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-EC');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Historial de Asistencia</h2>
                <Button variant="primary" onClick={handleOpenCreate}>+ Fichaje Manual</Button>
            </div>

            {/* FILTROS */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={4}>
                            <Form.Label>Empleado</Form.Label>
                            <Form.Select value={filtroEmpleado} onChange={e => setFiltroEmpleado(Number(e.target.value))}>
                                <option value={0}>Todos</option>
                                {empleados.map(e => <option key={e.idEmpleado} value={e.idEmpleado}>{e.apellido} {e.nombre}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Desde</Form.Label>
                            <Form.Control type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Hasta</Form.Label>
                            <Form.Control type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        </Col>
                        <Col md={2}>
                            <Button variant="outline-primary" className="w-100" onClick={loadData}>Filtrar</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <Card className="shadow-sm">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Empleado</th>
                                <th>Evento</th>
                                <th>Origen</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fichajes.map((log) => (
                                <tr key={log.idFichaje}>
                                    <td className="fw-bold">{formatDate(log.timestampUtc)}</td>
                                    <td>{log.nombreEmpleado}</td>
                                    <td>
                                        <Badge bg={log.tipoEvento === 'ENTRADA' ? 'success' : log.tipoEvento === 'SALIDA' ? 'danger' : 'warning'}>
                                            {log.tipoEvento}
                                        </Badge>
                                    </td>
                                    <td className="small text-muted">
                                        {log.origen} {log.esCorregido && <span className="text-warning" title="Editado por Admin">✎</span>}
                                    </td>
                                    <td className="text-end">
                                        <Button variant="link" size="sm" onClick={() => handleOpenEdit(log)}>✏️</Button>
                                        <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(log.idFichaje)}>🗑️</Button>
                                    </td>
                                </tr>
                            ))}
                            {fichajes.length === 0 && <tr><td colSpan={5} className="text-center py-4">No hay registros en este rango.</td></tr>}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* MODAL EDICIÓN/CREACIÓN */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingFichaje ? 'Editar Fichaje' : 'Fichaje Manual'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Empleado</Form.Label>
                            <Form.Select
                                value={formIdEmpleado}
                                onChange={e => setFormIdEmpleado(Number(e.target.value))}
                                disabled={!!editingFichaje} // No cambiar empleado al editar
                            >
                                <option value={0}>Seleccione...</option>
                                {empleados.map(e => <option key={e.idEmpleado} value={e.idEmpleado}>{e.apellido} {e.nombre}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha</Form.Label>
                                    <Form.Control type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hora</Form.Label>
                                    <Form.Control type="time" value={formHora} onChange={e => setFormHora(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo Evento</Form.Label>
                            <Form.Select value={formTipo} onChange={e => setFormTipo(e.target.value)}>
                                <option value="ENTRADA">ENTRADA</option>
                                <option value="INICIO_ALMUERZO">INICIO_ALMUERZO</option>
                                <option value="FIN_ALMUERZO">FIN_ALMUERZO</option>
                                <option value="SALIDA">SALIDA</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Guardar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Fichajes;