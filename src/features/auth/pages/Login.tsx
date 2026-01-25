import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Spinner, InputGroup, Button } from 'react-bootstrap';
import axiosClient from '../../../api/axiosClient';
import { useAuth } from '../../../context/AuthContext';
import { useConfig } from '../../../context/ConfigContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { getConfig } = useConfig();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosClient.post('/Auth/login', {
                username: username,
                password: password
            });

            const token = response.data.token;
            login(token);
            navigate('/dashboard');

        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else {
                setError('Error al iniciar sesión. Intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100 w-100"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <div className="card p-4 shadow-lg animate-fade-in" style={{ width: '420px', maxWidth: '90%' }}>
                <div className="text-center mb-4">
                    <h2 className="gradient-text mb-2">{getConfig('NOMBRE_EMPRESA', 'RRHH System')}</h2>
                    <p className="text-muted">Ingrese sus credenciales</p>
                </div>

                {error && (
                    <Alert variant="danger" className="animate-fade-in" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico o Cédula</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Contraseña</label>
                        <InputGroup>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                className="border-start-0"
                                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                            >
                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                            </Button>
                        </InputGroup>
                        <div className="d-flex justify-content-end mt-1">
                            <Link to="/forgot-password" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Iniciando sesión...
                            </>
                        ) : (
                            'Ingresar'
                        )}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <small className="text-muted">Sistema de Control de Empleados v1.0</small>
                </div>
            </div>
        </div>
    );
};

export default Login;