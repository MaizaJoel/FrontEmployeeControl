import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { CreateAdelanto, Adelanto } from '../../services/adelantoService';
import { empleadoService } from '../../services/empleadoService';
import { Empleado } from '../../types';

interface Props {
    show: boolean;
    handleClose: () => void;
    handleSave: (data: CreateAdelanto) => Promise<void>;
    adelantoToEdit: Adelanto | null;
}

const AdelantoModal = ({ show, handleClose, handleSave, adelantoToEdit }: Props) => {
    // Datos maestros
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Formulario
    const [idEmpleado, setIdEmpleado] = useState<number>(0);
    const [monto, setMonto] = useState<number>(0);
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');

    // Cargar empleados al iniciar
    useEffect(() => {
        if (show) loadEmpleados();
    }, [show]);

    // Rellenar formulario si es edición
    useEffect(() => {
        if (show) {
            if (adelantoToEdit) {
                setIdEmpleado(adelantoToEdit.idEmpleado);
                setMonto(adelantoToEdit.monto);
                setDescripcion(adelantoToEdit.descripcion);
            } else {
                // Reset
                setMonto(0);
                setDescripcion('');
                // Si ya hay empleados, seleccionar el primero por defecto
                if (empleados.length > 0) setIdEmpleado(empleados[0].idEmpleado);
            }
            setError('');
        }
    }, [adelantoToEdit, show, empleados]);

    const loadEmpleados = async () => {
        setLoadingData(true);
        try {
            const data = await empleadoService.getAll();
            // Solo mostrar empleados ACTIVOS
            setEmpleados(data.filter(e => e.activo));
        } catch (err) {
            setError('No se pudo cargar la lista de empleados.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones locales básicas
        if (idEmpleado === 0) {
            setError('Seleccione un empleado.');
            return;
        }
        if (monto <= 0) {
            setError('El monto debe ser mayor a 0.');
            return;
        }

        try {
            await handleSave({ idEmpleado, monto, descripcion });
            // El padre cerrará el modal si todo sale bien
        } catch (err: any) {
            console.error("Error creando adelanto:", err);
            const responseData = err.response?.data;

            // Lógica robusta para leer errores de .NET
            if (responseData?.errors) {
                // Errores de validación (ej. Descripción muy corta)
                const validationMsg = Object.values(responseData.errors).flat().join(', ');
                setError(validationMsg || 'Error de validación en los datos.');
            } else {
                // Errores lógicos (ej. Empleado inactivo)
                const msg = responseData?.Message || responseData?.message || 'Error al guardar.';
                setError(msg);
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{adelantoToEdit ? 'Editar Solicitud' : 'Nueva Solicitud'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loadingData && <div className="text-center mb-2"><Spinner size="sm" animation="border" /> Cargando empleados...</div>}

                    <Form.Group className="mb-3">
                        <Form.Label>Empleado</Form.Label>
                        <Form.Select
                            value={idEmpleado}
                            onChange={e => setIdEmpleado(Number(e.target.value))}
                            disabled={!!adelantoToEdit || loadingData}
                        >
                            <option value={0}>Seleccione...</option>
                            {empleados.map(e => (
                                <option key={e.idEmpleado} value={e.idEmpleado}>
                                    {e.apellido} {e.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Monto ($)</Form.Label>
                        <Form.Control
                            type="number" step="0.01" min="1" max="2000"
                            value={monto}
                            onChange={e => setMonto(parseFloat(e.target.value))}
                        />
                        <Form.Text className="text-muted">Máximo $2000</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Motivo</Form.Label>
                        <Form.Control
                            as="textarea" rows={2}
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Ej: Emergencia médica..."
                        />
                        <Form.Text className="text-muted">Mínimo 5 caracteres</Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit">Guardar</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AdelantoModal;