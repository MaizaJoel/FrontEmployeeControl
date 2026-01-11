import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Empleado, Cargo } from '../../../types';
import { cargoService } from '../../../services/cargoService';

interface EmpleadoModalProps {
    show: boolean;
    handleClose: () => void;
    handleSave: (empleado: Empleado) => Promise<void>; // Returns Promise to handle errors
    empleadoToEdit: Empleado | null;
}

const EmpleadoModal = ({ show, handleClose, handleSave, empleadoToEdit }: EmpleadoModalProps) => {
    // --- STATES ---
    const [formData, setFormData] = useState<Partial<Empleado>>({
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        email: '',
        idCargo: 0,
        activo: true
    });

    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loadingCargos, setLoadingCargos] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');

    // --- EFFECTS ---

    // Load cargos when modal opens
    useEffect(() => {
        if (show) {
            loadCargos();
        }
    }, [show]);

    // Reset or Load data when editing
    useEffect(() => {
        if (empleadoToEdit) {
            setFormData({ ...empleadoToEdit });
        } else {
            setFormData({
                nombre: '', apellido: '', cedula: '', telefono: '',
                email: '', idCargo: 0, activo: true
            });
        }
        setErrors({});
        setApiError('');
    }, [empleadoToEdit, show]);

    // --- LOGIC ---

    const loadCargos = async () => {
        setLoadingCargos(true);
        try {
            const data = await cargoService.getAll();
            setCargos(data);
        } catch (err) {
            console.error('Error loading cargos:', err);
            setApiError('No se pudieron cargar los cargos. Verifique el backend.');
        } finally {
            setLoadingCargos(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));

        // Clear validation error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellido?.trim()) newErrors.apellido = 'El apellido es requerido';

        if (!formData.cedula?.trim()) {
            newErrors.cedula = 'La cédula es requerida';
        } else if (!/^\d{10}$/.test(formData.cedula)) {
            newErrors.cedula = 'La cédula debe tener 10 dígitos numéricos';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (!formData.idCargo || Number(formData.idCargo) === 0) {
            newErrors.idCargo = 'Debe seleccionar un cargo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setApiError('');
        setErrors({});

        const dataToSend = {
            ...formData,
            nombre: formData.nombre?.trim(),
            apellido: formData.apellido?.trim(),
            cedula: formData.cedula?.trim(),
            email: formData.email?.trim(),
            telefono: formData.telefono?.trim() || null,
            idCargo: Number(formData.idCargo)
        };

        try {
            await handleSave(dataToSend as Empleado);
        } catch (err: any) {
            // 👇 DEBUG: Esto nos mostrará en la consola (F12) qué llega exactamente
            console.log("FULL ERROR:", err.response);

            const responseData = err.response?.data;

            // 1. Normalizamos el mensaje a minúsculas para facilitar la búsqueda
            const rawMsg = responseData?.Message || responseData?.message || '';
            const serverMsg = rawMsg.toString().toLowerCase();

            // 2. Búsqueda simplificada (palabras clave)
            if (serverMsg.includes("cédula") && serverMsg.includes("registrada")) {
                setErrors(prev => ({ ...prev, cedula: "La cédula ya existe en el sistema." }));
            }
            else if (serverMsg.includes("correo") && serverMsg.includes("registrado")) {
                setErrors(prev => ({ ...prev, email: "El correo ya existe en el sistema." }));
            }
            else if (responseData?.errors) {
                // Errores automáticos de .NET (campos requeridos, etc)
                const validationMsg = Object.values(responseData.errors).flat().join(', ');
                setApiError(validationMsg || 'Faltan datos requeridos.');
            }
            else {
                // Error desconocido (o el 500 si sigue pasando)
                setApiError(rawMsg || 'Error del servidor. Intente nuevamente.');
            }
        }
    };

    const isEditMode = !!empleadoToEdit;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? 'Editar Empleado' : 'Nuevo Empleado'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {apiError && <Alert variant="danger">{apiError}</Alert>}

                    {loadingCargos && (
                        <div className="text-center mb-3">
                            <Spinner animation="border" size="sm" /> <span className="text-muted ms-2">Cargando lista de cargos...</span>
                        </div>
                    )}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" name="nombre"
                                    value={formData.nombre || ''}
                                    onChange={handleChange}
                                    isInvalid={!!errors.nombre}
                                    placeholder="Ej: Juan"
                                />
                                <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" name="apellido"
                                    value={formData.apellido || ''}
                                    onChange={handleChange}
                                    isInvalid={!!errors.apellido}
                                    placeholder="Ej: Pérez"
                                />
                                <Form.Control.Feedback type="invalid">{errors.apellido}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Cédula <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" name="cedula"
                                    value={formData.cedula || ''}
                                    onChange={handleChange}
                                    isInvalid={!!errors.cedula}
                                    placeholder="10 dígitos"
                                    maxLength={10}
                                />
                                <Form.Control.Feedback type="invalid">{errors.cedula}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text" name="telefono"
                                    value={formData.telefono || ''}
                                    onChange={handleChange}
                                    placeholder="Opcional"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="email" name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            placeholder="ejemplo@correo.com"
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cargo (Puesto) <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="idCargo"
                            value={formData.idCargo || 0}
                            onChange={handleChange}
                            isInvalid={!!errors.idCargo}
                            disabled={loadingCargos}
                        >
                            <option value="0">Seleccione un cargo...</option>
                            {cargos.map(cargo => (
                                <option key={cargo.idCargo} value={cargo.idCargo}>
                                    {cargo.nombreCargo}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.idCargo}</Form.Control.Feedback>
                    </Form.Group>

                    {isEditMode && (
                        <Form.Group className="mb-3 bg-light p-2 rounded">
                            <Form.Check
                                type="checkbox"
                                name="activo"
                                id="activo-check"
                                label="Empleado Activo"
                                checked={formData.activo ?? true}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                        {isEditMode ? 'Guardar Cambios' : 'Crear Empleado'}
                    </Button>

                    {!isEditMode && (
                        <div className="alert alert-info mt-3 py-2 small">
                            <i className="bi bi-info-circle me-2"></i>
                            Al crear el empleado, se generará automáticamente su usuario de sistema.
                            <br />
                            <strong>Contraseña temporal:</strong> (Su número de cédula) + *Freesias
                        </div>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EmpleadoModal;