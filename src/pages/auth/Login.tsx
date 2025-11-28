import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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
                    <h2 className="gradient-text mb-2">RRHH System</h2>
                    <p className="text-muted">Ingrese sus credenciales</p>
                </div>

                {error && (
                    <Alert variant="danger" className="animate-fade-in" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Usuario</label>
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
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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