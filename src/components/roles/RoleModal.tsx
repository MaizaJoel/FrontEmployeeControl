import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
    show: boolean;
    handleClose: () => void;
    handleSave: (data: { name: string; template: string }) => Promise<void>;
}

const RoleModal = ({ show, handleClose, handleSave }: Props) => {
    const [roleName, setRoleName] = useState('');
    const [template, setTemplate] = useState('Vacio'); // Estado para el select
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setRoleName('');
            setTemplate('Vacio'); // Resetear al abrir
            setLoading(false);
        }
    }, [show]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;

        setLoading(true);
        try {
            // Enviamos el nombre Y la plantilla
            await handleSave({ name: roleName, template });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Nuevo Rol de Seguridad</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    {/* Input Nombre */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Rol</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej: Auditor Financiero"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                            autoFocus
                        />
                    </Form.Group>

                    {/* 👇 Nuevo Select de Plantilla */}
                    <Form.Group className="mb-3">
                        <Form.Label>Plantilla de Permisos (Opcional)</Form.Label>
                        <Form.Select
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                        >
                            <option value="Vacio">Ninguno (Configurar manualmente)</option>
                            <option value="Admin">Administrador (Acceso Total)</option>
                            <option value="Asistente">Asistente (Lectura y Reportes)</option>
                            <option value="Empleado">Empleado (Básico)</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Se pre-cargarán los permisos. Luego podrás editarlos.
                        </Form.Text>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Rol'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default RoleModal;