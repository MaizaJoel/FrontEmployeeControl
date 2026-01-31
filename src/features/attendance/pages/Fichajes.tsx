import { useEffect, useState } from 'react';
import { Table, Spinner, Badge, Card, Alert, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { fichajeService } from '../../../services/fichajeService';
import { FichajeLog } from '../../../types';
import { EventTypes } from '../../../constants/events';
import { empleadoService } from '../../../services/empleadoService';
import { Empleado } from '../../../types';
import JornadaModal from '../components/FichajesJornadaModal';
import EmployeeSelect from '../../employees/components/EmployeeSelect';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';

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
        // IMPORTANTE: El backend ahora envía la fecha en "Hora Empresa" (ej: "2026-01-26T08:30:00")
        // Parseamos directamente la cadena sin usar new Date() que añadiría offset del navegador
        const dateTimeParts = log.timestampUtc.split('T');
        const datePart = dateTimeParts[0]; // "2026-01-26"
        const timePart = dateTimeParts[1]?.substring(0, 5) || '00:00'; // "08:30"
        setFormFecha(datePart);
        setFormHora(timePart);
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
            setToast({ show: true, message: 'Fichaje actualizado correctamente.', variant: 'success' });
        } catch (err) {
            setToast({ show: true, message: 'Error al actualizar.', variant: 'danger' });
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Fichaje',
            message: '¿Eliminar este registro permanentemente?',
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await fichajeService.delete(id);
                    loadData();
                    setToast({ show: true, message: 'Fichaje eliminado.', variant: 'success' });
                } catch (e) {
                    setToast({ show: true, message: 'Error al eliminar', variant: 'danger' });
                }
            }
        });
    };

    // El backend ahora envía la fecha en formato "Hora Empresa" (ej: "2026-01-26T08:30:00")
    // Solo formateamos para mostrar, sin conversiones de timezone
    const formatDate = (isoString: string) => {
        // Parseamos la fecha/hora directamente de la cadena
        const [datePart, timePart] = isoString.split('T');
        const [year, month, day] = datePart.split('-');
        const time = timePart?.substring(0, 5) || '00:00';
        return `${day}/${month}/${year} ${time}`;
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

export default Fichajes;