import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Adelanto, CreateAdelanto } from '../../services/adelantoService';
import { empleadoService } from '../../services/empleadoService';
import { Empleado } from '../../types';

interface Props {
    show: boolean;
    handleClose: () => void;
    handleSave: (data: CreateAdelanto) => void;
    adelantoToEdit: Adelanto | null;
}

const AdelantoModal = ({ show, handleClose, handleSave, adelantoToEdit }: Props) => {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    // Form State
    const [idEmpleado, setIdEmpleado] = useState<number>(0);
    const [monto, setMonto] = useState<number>(0);
    const [descripcion, setDescripcion] = useState('');

    useEffect(() => {
        loadEmpleados();
    }, []);

    useEffect(() => {
        if (show) {
            if (adelantoToEdit) {
                // Modo Edición
                setIdEmpleado(adelantoToEdit.idEmpleado);
                setMonto(adelantoToEdit.monto);
                setDescripcion(adelantoToEdit.descripcion);
            } else {
                // Modo Crear (Reset)
                setMonto(0);
                setDescripcion('');
                // Si hay empleados, seleccionar el primero por defecto
                if (empleados.length > 0) setIdEmpleado(empleados[0].idEmpleado);
            }
        }
    }, [show, adelantoToEdit, empleados]);

    const loadEmpleados = async () => {
        try {
            const data = await empleadoService.getAll();
            setEmpleados(data);
            // Si es nuevo y no hay empleado seleccionado, setear el primero
            if (!adelantoToEdit && data.length > 0 && idEmpleado === 0) {
                setIdEmpleado(data[0].idEmpleado);
            }
        } catch (error) {
            console.error("Error cargando empleados", error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (monto <= 0) {
            alert("El monto debe ser mayor a 0");
            return;
        }
        handleSave({ idEmpleado, monto, descripcion });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{adelantoToEdit ? 'Editar Solicitud' : 'Solicitar Adelanto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Empleado</Form.Label>
                        <Form.Select
                            value={idEmpleado}
                            onChange={e => setIdEmpleado(Number(e.target.value))}
                            disabled={!!adelantoToEdit} // No cambiar empleado al editar
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
                            type="number"
                            min="1" max="2000"
                            value={monto}
                            onChange={e => setMonto(parseFloat(e.target.value))}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Motivo / Descripción</Form.Label>
                        <Form.Control
                            as="textarea" rows={3}
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Ej: Emergencia médica, reparación vehículo..."
                            required
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