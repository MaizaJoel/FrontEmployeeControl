import { useEffect, useState } from 'react';
import { Table, Spinner, Badge, Card, Alert, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { fichajeService } from '../../../services/fichajeService';
import { FichajeLog } from '../../../types';
import { EventTypes } from '../../../constants/events';
import { empleadoService } from '../../../services/empleadoService';
import { Empleado } from '../../../types';
import JornadaModal from '../components/FichajesJornadaModal';
import EmployeeSelect from '../../employees/components/EmployeeSelect';

const Fichajes = () => {
    const [fichajes, setFichajes] = useState<FichajeLog[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    // Filtros
    const [filtroEmpleado, setFiltroEmpleado] = useState<number>(0);
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modals
    const [showJornadaModal, setShowJornadaModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Edición Individual (Para corregir UN fichaje específico)
    const [editingFichaje, setEditingFichaje] = useState<FichajeLog | null>(null);
    const [formFecha, setFormFecha] = useState('');
    const [formHora, setFormHora] = useState('');
    const [formTipo, setFormTipo] = useState('ENTRADA');

    useEffect(() => {
        loadMaestros();
        loadData();
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

    // --- Handlers para Jornada Completa ---
    const handleOpenJornada = () => {
        setShowJornadaModal(true);
    };

    const handleJornadaSaved = () => {
        loadData(); // Recargar tabla tras guardar jornada
        setShowJornadaModal(false);
    };

    // --- Handlers para Edición Individual ---
    const handleOpenEdit = (log: FichajeLog) => {
        setEditingFichaje(log);
        const dt = new Date(log.timestampUtc);
        setFormFecha(dt.toLocaleDateString('en-CA'));
        setFormHora(dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        setFormTipo(log.tipoEvento);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingFichaje) return;
        try {
            // FIXED: Enviar la hora nominal (Local) tal cual, sin convertir a UTC aquí.
            // El backend leerá "08:30" y usará la Zona Horaria de la Empresa para calcular el UTC real.
            const fechaHoraLocal = `${formFecha}T${formHora}:00`;
            await fichajeService.update(editingFichaje.idFichaje, {
                idEmpleado: editingFichaje.idEmpleado,
                fechaHoraLocal: fechaHoraLocal,
                tipoEvento: formTipo
            });
            setShowEditModal(false);
            loadData();
        } catch (err) {
            alert('Error al actualizar.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este registro permanentemente?")) return;
        try {
            await fichajeService.delete(id);
            loadData();
        } catch (e) { alert("Error al eliminar"); }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-EC');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Historial de Asistencia</h2>
                <Button variant="primary" onClick={handleOpenJornada}>
                    + Registrar Jornada
                </Button>
            </div>

            {/* FILTROS */}
            <Card className="mb-4 shadow-sm" style={{ overflow: 'visible', position: 'relative', zIndex: 10 }}>
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={4}>
                            <Form.Label>Empleado</Form.Label>
                            <EmployeeSelect
                                empleados={empleados}
                                selectedId={filtroEmpleado}
                                onSelect={setFiltroEmpleado}
                            />
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
                                        <Badge bg={log.tipoEvento === EventTypes.ENTRADA ? 'success' : log.tipoEvento === EventTypes.SALIDA ? 'danger' : 'warning'}>
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
                            {fichajes.length === 0 && <tr><td colSpan={5} className="text-center py-4">No hay registros.</td></tr>}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* MODAL PARA CREAR JORNADA COMPLETA */}
            <JornadaModal
                show={showJornadaModal}
                handleClose={() => setShowJornadaModal(false)}
                handleSave={handleJornadaSaved}
                empleados={empleados}
                initialDate={fechaInicio}
                initialEmployeeId={filtroEmpleado}
            />

            {/* MODAL PARA EDITAR UN SOLO FICHAJE (Corrección Rápida) */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton><Modal.Title>Corregir Hora</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col><Form.Control type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)} /></Col>
                        <Col><Form.Control type="time" value={formHora} onChange={e => setFormHora(e.target.value)} /></Col>
                    </Row>
                    <Form.Select className="mt-3" value={formTipo} onChange={e => setFormTipo(e.target.value)}>
                        <option value={EventTypes.ENTRADA}>{EventTypes.ENTRADA}</option>
                        <option value={EventTypes.INICIO_ALMUERZO}>{EventTypes.INICIO_ALMUERZO}</option>
                        <option value={EventTypes.FIN_ALMUERZO}>{EventTypes.FIN_ALMUERZO}</option>
                        <option value={EventTypes.SALIDA}>{EventTypes.SALIDA}</option>
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveEdit}>Guardar Cambios</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Fichajes;