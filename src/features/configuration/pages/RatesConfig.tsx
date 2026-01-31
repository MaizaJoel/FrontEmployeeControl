
import { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { tasasService, Tasa, HorarioTasa } from '../../../services/tasasService';
import { configuracionService, Configuracion } from '../../../services/configuracionService';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';

const DAYS_OF_WEEK = [
    { key: 'LUN', label: 'Lunes' },
    { key: 'MAR', label: 'Martes' },
    { key: 'MIE', label: 'Miércoles' },
    { key: 'JUE', label: 'Jueves' },
    { key: 'VIE', label: 'Viernes' },
    { key: 'SAB', label: 'Sábado' },
    { key: 'DOM', label: 'Domingo' },
    { key: 'FERIADO', label: 'Feriados' }
];

const ConfiguracionTasas = () => {
    const [tasas, setTasas] = useState<Tasa[]>([]);
    const [horarios, setHorarios] = useState<HorarioTasa[]>([]);
    const [laborableConfigDays, setLaborableConfigDays] = useState<Set<string>>(new Set()); // Para saber qué días ya son laborables
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedTasaId, setSelectedTasaId] = useState<number>(0);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [horaInicio, setHoraInicio] = useState('00:00');
    const [horaFin, setHoraFin] = useState('23:59');
    const [esLaborable, setEsLaborable] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tasasData, horariosData, configs] = await Promise.all([
                tasasService.getAllTasas(),
                tasasService.getAllHorarios(),
                configuracionService.getAll()
            ]);
            setTasas(tasasData);
            setHorarios(horariosData);

            // Extract DIAS_LABORABLES
            const diasLab = configs.find(c => c.clave === 'DIAS_LABORABLES')?.valor || '';
            const daysSet = new Set(diasLab.split(',').map(d => d.trim().toUpperCase()));
            setLaborableConfigDays(daysSet);

        } catch (err: any) {
            console.error(err);
            setError('Error al cargar datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleDayToggle = (dayKey: string) => {
        let newDays;
        if (selectedDays.includes(dayKey)) {
            newDays = selectedDays.filter(d => d !== dayKey);
        } else {
            newDays = [...selectedDays, dayKey];
        }
        setSelectedDays(newDays);

        // Smart guess: si todos los seleccionados son laborables, marcar check
        if (newDays.length > 0) {
            const allAreLaborable = newDays.every(d => laborableConfigDays.has(d));
            setEsLaborable(allAreLaborable);
        }
    };

    const handleEdit = (horario: HorarioTasa) => {
        setEditingId(horario.idHorarioTasa);
        setSelectedTasaId(horario.idTasa);
        const days = horario.diasAplicacion.split(',');
        setSelectedDays(days);
        setHoraInicio(horario.horaInicio.substring(0, 5));
        setHoraFin(horario.horaFin.substring(0, 5));

        // Determine initial check state
        const allAreLaborable = days.every(d => laborableConfigDays.has(d));
        setEsLaborable(allAreLaborable);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setSelectedDays([]);
        setSelectedTasaId(0);
        setHoraInicio('00:00');
        setHoraFin('23:59');
        setEsLaborable(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (selectedTasaId === 0) {
            setError('Seleccione una tasa.');
            return;
        }
        if (selectedDays.length === 0) {
            setError('Seleccione al menos un día.');
            return;
        }

        try {
            const diasStr = selectedDays.join(',');
            const payload = {
                idHorarioTasa: editingId || 0,
                idTasa: selectedTasaId,
                diasAplicacion: diasStr,
                horaInicio: horaInicio + ':00',
                horaFin: horaFin + ':00',
                esLaborable: esLaborable // Enviar flag
            };

            if (editingId) {
                await tasasService.updateHorario(editingId, payload);
            } else {
                await tasasService.createHorario(payload);
            }

            // Reload to refresh configs (DIAS_LABORABLES might have changed)
            await loadData();
            handleCancelEdit();
        } catch (err: any) {
            console.error(err);
            setError('Error al guardar la regla.');
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Regla',
            message: '¿Eliminar esta regla?',
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await tasasService.deleteHorario(id);
                    setHorarios(horarios.filter(h => h.idHorarioTasa !== id));
                    setToast({ show: true, message: 'Regla eliminada correctamente.', variant: 'success' });
                } catch (err) {
                    setToast({ show: true, message: 'Error al eliminar la regla.', variant: 'danger' });
                }
            }
        });
    };

    return (
        <div className="container mt-4 animate__animated animate__fadeIn">
            <h2 className="mb-4 text-primary">Configuración de Tasas de Extras</h2>
            <p className="text-muted">
                Defina qué tasa se aplica según el día y la hora. El sistema buscará la regla que coincida con el fichaje.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={5}>
                    <Card className={`shadow-sm mb-4 ${editingId ? 'border-warning' : ''} `}>
                        <Card.Header className={`fw-bold ${editingId ? 'bg-warning text-dark' : 'bg-white'} `}>
                            {editingId ? 'Editar Regla' : 'Nueva Regla'}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSave}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tasa a aplicar</Form.Label>
                                    <Form.Select
                                        value={selectedTasaId}
                                        onChange={e => setSelectedTasaId(Number(e.target.value))}
                                        required
                                    >
                                        <option value={0}>Seleccione...</option>
                                        {tasas.map(t => (
                                            <option key={t.idTasa} value={t.idTasa}>
                                                {t.codigoTasa} - {t.descripcion} (x{t.tasaMultiplicador})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Días de Aplicación</Form.Label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {DAYS_OF_WEEK.map(day => (
                                            <Button
                                                key={day.key}
                                                variant={selectedDays.includes(day.key) ? 'primary' : 'outline-secondary'}
                                                size="sm"
                                                onClick={() => handleDayToggle(day.key)}
                                                type="button"
                                            >
                                                {selectedDays.includes(day.key) ? '✓ ' : ''}{day.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <Form.Text className="text-muted">
                                        Seleccione uno o varios días para esta regla.
                                    </Form.Text>
                                </Form.Group>

                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Hora Inicio</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={horaInicio}
                                                onChange={e => setHoraInicio(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Hora Fin</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={horaFin}
                                                onChange={e => setHoraFin(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        label="¿Es Día Laborable?"
                                        checked={esLaborable}
                                        onChange={(e) => setEsLaborable(e.target.checked)}
                                        id="chk-esLaborable"
                                        className="fw-bold text-primary"
                                    />
                                    <Form.Text className="text-muted">
                                        Si se marca, se añadirán estos días a la configuración de 'DIAS_LABORABLES' (jornada normal de 8h). Si no, se removerán.
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant={editingId ? 'warning' : 'success'} type="submit" disabled={loading}>
                                        {loading ? <Spinner size="sm" animation="border" /> : (editingId ? 'Actualizar Regla y Sync' : 'Guardar Regla y Sync')}
                                    </Button>
                                    {editingId && (
                                        <Button variant="secondary" onClick={handleCancelEdit}>
                                            Cancelar Edición
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={7}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light fw-bold">Reglas Activas</Card.Header>
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tasa</th>
                                        <th>Días</th>
                                        <th>Horario</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horarios.map(h => (
                                        <tr key={h.idHorarioTasa} className={editingId === h.idHorarioTasa ? 'table-warning' : ''}>
                                            <td>
                                                <div className="fw-bold text-primary">
                                                    {h.tasa?.descripcion}
                                                </div>
                                                <small className="text-muted">Code: {h.tasa?.codigoTasa}</small>
                                            </td>
                                            <td>
                                                {h.diasAplicacion.split(',').map(d => (
                                                    <Badge bg="info" className="me-1 text-dark" key={d}>{d}</Badge>
                                                ))}
                                            </td>
                                            <td>
                                                {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                                            </td>
                                            <td className="text-end">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEdit(h)}
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(h.idHorarioTasa)}
                                                >
                                                    🗑️
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {horarios.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4 text-muted">
                                                No hay reglas definidas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>
            </Row>

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

export default ConfiguracionTasas;
