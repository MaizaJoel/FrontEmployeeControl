import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Adelanto, CreateAdelanto } from '../../../../services/adelantoService';
import { empleadoService } from '../../../../services/empleadoService';
import { Empleado } from '../../../../types';

interface Props {
    show: boolean;
    handleClose: () => void;
    handleSave: (data: CreateAdelanto) => void;
    adelantoToEdit: Adelanto | null;
}

const AdelantoModal = ({ show, handleClose, handleSave, adelantoToEdit }: Props) => {
    const [monto, setMonto] = useState(0);
    const [descripcion, setDescripcion] = useState('');
    const [fechaSolicitud, setFechaSolicitud] = useState(new Date().toISOString().split('T')[0]);
    const [idEmpleado, setIdEmpleado] = useState<number | null>(null);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            loadEmpleados();
        }
    }, [show]);

    useEffect(() => {
        if (adelantoToEdit) {
            setMonto(adelantoToEdit.monto);
            setDescripcion(adelantoToEdit.descripcion);
            setFechaSolicitud(adelantoToEdit.fechaSolicitud.split('T')[0]);
            setIdEmpleado(adelantoToEdit.idEmpleado);
        } else {
            setMonto(0);
            setDescripcion('');
            setFechaSolicitud(new Date().toISOString().split('T')[0]);
            setIdEmpleado(null);
        }
        setError('');
    }, [adelantoToEdit, show]);

    const loadEmpleados = async () => {
        try {
            const data = await empleadoService.getAll();
            setEmpleados(data);
        } catch (err) {
            console.error("Error al cargar los empleados", err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validación: Deben seleccionar un empleado
        if (!idEmpleado) {
            setError('Debe seleccionar un empleado.');
            return;
        }

        // Validación: Si se ingresa descripción, debe tener al menos 5 caracteres
        if (descripcion.trim() && descripcion.trim().length < 5) {
            setError('La descripción es opcional puede dejarse vacía.');
            return;
        }

        handleSave({
            idEmpleado: idEmpleado,
            monto,
            descripcion,
            fechaSolicitud
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{adelantoToEdit ? 'Editar Solicitud' : 'Nueva Solicitud'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Empleado</Form.Label>
                        <Form.Select
                            value={idEmpleado || ''}
                            onChange={(e) => setIdEmpleado(Number(e.target.value))}
                            required
                        >
                            <option value="">Seleccione un empleado...</option>
                            {empleados.map(emp => (
                                <option key={emp.idEmpleado} value={emp.idEmpleado}>
                                    {emp.nombre} {emp.apellido}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Monto</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={monto}
                            onChange={(e) => setMonto(parseFloat(e.target.value))}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de Solicitud</Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaSolicitud}
                            onChange={(e) => setFechaSolicitud(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Ingrese el motivo (opcional)"
                        />
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