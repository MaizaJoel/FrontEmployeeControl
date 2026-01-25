import { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { useConfig } from '../../../context/ConfigContext';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const { getConfig } = useConfig();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError('Enlace inválido o expirado. Por favor solicita uno nuevo.');
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axiosClient.post('/Auth/reset-password', {
                email,
                token,
                newPassword,
                confirmPassword
            });
            setMessage('Contraseña restablecida correctamente.');
            setTimeout(() => navigate('/'), 3000); // Redirect after 3s
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.errors) {
                // Show specific validation errors
                const errors = Object.values(err.response.data.errors).flat().join(' ');
                setError(errors || 'Error al restablecer contraseña.');
            } else {
                setError('Error al restablecer contraseña. El enlace puede haber expirado.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 w-100">
                <Alert variant="danger">
                    Enlace inválido. <Link to="/forgot-password">Solicitar nuevo enlace</Link>
                </Alert>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 w-100"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card p-4 shadow-lg animate-fade-in" style={{ width: '420px', maxWidth: '90%' }}>
                <div className="text-center mb-4">
                    <h3 className="gradient-text mb-2">{getConfig('NOMBRE_EMPRESA', 'RRHH System')}</h3>
                    <h5 className="text-muted">Nueva Contraseña</h5>
                </div>

                {message && <Alert variant="success">{message}. Redirigiendo al login...</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                {!message && (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Contraseña</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPass ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? '🙈' : '👁️'}
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirmar Contraseña</Form.Label>
                            <Form.Control
                                type={showPass ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </Form.Group>

                        <Button type="submit" className="w-100 mb-3" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : 'Guardar Contraseña'}
                        </Button>
                    </Form>
                )}
                <div className="text-center">
                    <Link to="/" className="text-decoration-none">← Cancelar</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
