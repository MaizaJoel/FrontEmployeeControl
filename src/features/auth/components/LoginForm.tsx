import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { authService } from '../../../services/authService';

interface Props {
    show: boolean;
    handleClose: () => void;
}

const ChangePasswordModal = ({ show, handleClose }: Props) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'las contraseñas nuevas no coinciden.' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            setMessage({ type: 'success', text: '¡Contraseña actualizada! Cerrando...' });

            // Limpiar y cerrar después de un momento
            setTimeout(() => {
                handleClose();
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage(null);
            }, 1500);

        } catch (err: any) {
            // Intentar leer error específico de Identity (ej. PasswordMismatch)
            const serverErrors = err.response?.data?.Errors;
            let errorText = 'Error al actualizar.';

            if (serverErrors && Array.isArray(serverErrors)) {
                errorText = serverErrors.map((e: any) => e.description).join(' ');
            } else if (err.response?.data?.Message) {
                errorText = err.response.data.Message;
            }

            setMessage({ type: 'danger', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar Contraseña</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message && <Alert variant={message.type}>{message.text}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña Actual</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                tabIndex={-1}
                            >
                                <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    <hr />

                    <Form.Group className="mb-3">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                tabIndex={-1}
                            >
                                <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                            >
                                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" /> : 'Actualizar'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;