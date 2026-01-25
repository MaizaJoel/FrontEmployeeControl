import { useState } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { useConfig } from '../../../context/ConfigContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { getConfig } = useConfig();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axiosClient.post('/Auth/forgot-password', { email });
            setMessage('Si el correo existe, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.');
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error al procesar la solicitud. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 w-100"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card p-4 shadow-lg animate-fade-in" style={{ width: '420px', maxWidth: '90%' }}>
                <div className="text-center mb-4">
                    <h3 className="gradient-text mb-2">{getConfig('NOMBRE_EMPRESA', 'RRHH System')}</h3>
                    <h5 className="text-muted">Recuperar Contraseña</h5>
                </div>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                        <Form.Text className="text-muted">
                            Te enviaremos un enlace para crear una nueva contraseña.
                        </Form.Text>
                    </Form.Group>

                    <Button type="submit" className="w-100 mb-3" disabled={loading || !!message}>
                        {loading ? <Spinner size="sm" animation="border" /> : 'Enviar Enlace'}
                    </Button>

                    <div className="text-center">
                        <Link to="/" className="text-decoration-none">← Volver al Login</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;
