import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Empleado } from '../../types';
import { fichajeService } from '../../services/fichajeService';

interface Props {
    show: boolean;
    handleClose: () => void;
    handleSave: () => void; // Callback para recargar la tabla
    empleados: Empleado[];
    initialDate?: string;
    initialEmployeeId?: number;
}

const FichajesJornadaModal = ({ show, handleClose, handleSave, empleados, initialDate, initialEmployeeId }: Props) => {
    // Formulario
    const [idEmpleado, setIdEmpleado] = useState<number>(0);
    const [fecha, setFecha] = useState('');

    // Horas (formato HH:mm)
    const [horaEntrada, setHoraEntrada] = useState('');
    const [horaSalidaAlmuerzo, setHoraSalidaAlmuerzo] = useState('');
    const [horaRegresoAlmuerzo, setHoraRegresoAlmuerzo] = useState('');
    const [horaSalida, setHoraSalida] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Inicializar
    useEffect(() => {
        if (show) {
            const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
            setFecha(initialDate || today);
            setIdEmpleado(initialEmployeeId || (empleados.length > 0 ? empleados[0].idEmpleado : 0));

            // Reset horas
            setHoraEntrada('08:00');
            setHoraSalidaAlmuerzo('');
            setHoraRegresoAlmuerzo('');
            setHoraSalida('17:00');
            setError('');
        }
    }, [show, initialDate, initialEmployeeId, empleados]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idEmpleado || !fecha || !horaEntrada) {
            setError('Empleado, Fecha y Hora de Entrada son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Generar lista de eventos a crear
            const eventos = [];

            // 1. ENTRADA
            eventos.push({ tipo: 'ENTRADA', hora: horaEntrada, esDiaSiguiente: false });

            // 2. ALMUERZO (Opcional)
            if (horaSalidaAlmuerzo && horaRegresoAlmuerzo) {
                let diaSig = false;
                // Si almuerzo es menor que entrada, asumimos día siguiente (muy raro pero posible)
                if (horaSalidaAlmuerzo < horaEntrada) diaSig = true;
                eventos.push({ tipo: 'INICIO_ALMUERZO', hora: horaSalidaAlmuerzo, esDiaSiguiente: diaSig });

                // Si regreso es menor que salida, seguro es día siguiente
                if (horaRegresoAlmuerzo < horaSalidaAlmuerzo) diaSig = true;
                eventos.push({ tipo: 'FIN_ALMUERZO', hora: horaRegresoAlmuerzo, esDiaSiguiente: diaSig });
            }

            // 3. SALIDA (Opcional pero común)
            if (horaSalida) {
                let diaSig = false;
                // Lógica inteligente: Si salida es menor que entrada (ej 01:00 < 20:00), es día siguiente
                // También comparamos con el regreso de almuerzo si existe
                const ultimaHora = horaRegresoAlmuerzo || horaEntrada;
                if (horaSalida < ultimaHora) {
                    diaSig = true;
                }
                eventos.push({ tipo: 'SALIDA', hora: horaSalida, esDiaSiguiente: diaSig });
            }

            // Enviar uno por uno al backend (o podrías crear un endpoint masivo nuevo)
            // Por ahora usaremos el endpoint manual existente en un bucle
            for (const evt of eventos) {
                // Construir fecha ISO
                const baseDate = new Date(fecha + 'T00:00:00');
                if (evt.esDiaSiguiente) {
                    baseDate.setDate(baseDate.getDate() + 1);
                }
                const fechaIso = baseDate.toISOString().split('T')[0]; // YYYY-MM-DD
                const fechaHoraLocal = `${fechaIso}T${evt.hora}:00`; // Formato local ISO

                await fichajeService.createManual({
                    idEmpleado,
                    fechaHoraLocal, // El backend lo convertirá a UTC
                    tipoEvento: evt.tipo
                });
            }

            handleSave(); // Notificar éxito
            handleClose();

        } catch (err: any) {
            console.error(err);
            setError('Error al guardar la jornada. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Jornada Completa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Empleado</Form.Label>
                                <Form.Select
                                    value={idEmpleado}
                                    onChange={e => setIdEmpleado(Number(e.target.value))}
                                >
                                    {empleados.map(e => (
                                        <option key={e.idEmpleado} value={e.idEmpleado}>
                                            {e.apellido} {e.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha Jornada</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fecha}
                                    onChange={e => setFecha(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <h6 className="text-muted mb-3">Horarios</h6>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-success">Entrada *</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={horaEntrada}
                                    onChange={e => setHoraEntrada(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-danger">Salida</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={horaSalida}
                                    onChange={e => setHoraSalida(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Si es menor a la entrada, se guardará como día siguiente.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Salida Almuerzo</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={horaSalidaAlmuerzo}
                                    onChange={e => setHoraSalidaAlmuerzo(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Regreso Almuerzo</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={horaRegresoAlmuerzo}
                                    onChange={e => setHoraRegresoAlmuerzo(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Jornada'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default FichajesJornadaModal;