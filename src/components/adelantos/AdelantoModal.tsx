import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Adelanto, CreateAdelanto } from '../../services/adelantoService';
import { useAuth } from '../../context/AuthContext';
import { empleadoService, Empleado } from '../../services/empleadoService';

interface Props {
    show: boolean;
    handleClose: () => void;
    handleSave: (data: CreateAdelanto) => void;
    adelantoToEdit: Adelanto | null;
}

const AdelantoModal = ({ show, handleClose, handleSave, adelantoToEdit }: Props) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    
    const [monto, setMonto] = useState(0);
    const [descripcion, setDescripcion] = useState('');
    const [idEmpleado, setIdEmpleado] = useState<number | null>(null);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && isAdmin) {
            loadEmpleados();
        }
    }, [show, isAdmin]);

    useEffect(() => {
        if (adelantoToEdit) {
            setMonto(adelantoToEdit.monto);
            setDescripcion(adelantoToEdit.descripcion);
            setIdEmpleado(adelantoToEdit.idEmpleado);
        } else {
            setMonto(0);
            setDescripcion('');
            setIdEmpleado(null);
        }
        setError('');
    }, [adelantoToEdit, show]);

    const loadEmpleados = async () => {
        try {
            const data = await empleadoService.getAll();
            setEmpleados(data);
        } catch (err) {
            console.error("Error loading employees", err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Si es admin y está creando, DEBE seleccionar empleado
        if (isAdmin && !adelantoToEdit && !idEmpleado) {
            setError('Debe seleccionar un empleado.');
            return;
        }

        // Si es empleado normal, el ID se ignora en el backend (usa el token), 
        // pero podemos mandarlo si queremos. El backend lo valida.
        // Si es Admin, el ID es obligatorio.
        
        handleSave({
            idEmpleado: idEmpleado || 0, // 0 si no se seleccionó (backend fallará si es admin)
            monto,
            descripcion
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
                    
                    {isAdmin && !adelantoToEdit && (
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
                    )}

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
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={descripcion} 
                            onChange={(e) => setDescripcion(e.target.value)} 
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