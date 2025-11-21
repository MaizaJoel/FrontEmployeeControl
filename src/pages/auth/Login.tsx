import { useState, FormEvent } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault(); // Evitar que se recargue la página
        setError('');

        try {
            // Llamamos a TU endpoint de C#
            const response = await axiosClient.post('/Auth/login', {
                username: username,
                password: password
            });

            // Si llegamos aquí, es éxito (200 OK)
            const token = response.data.token;

            // Guardamos la llave en el navegador
            localStorage.setItem('token', token);

            // Redirigimos al Dashboard
            navigate('/dashboard');

        } catch (err) {
            // Si falla (401 Unauthorized), mostramos error
            console.error(err);
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        // vh-100 = 100% de la altura de la ventana
        // w-100 = 100% del ancho
        <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-light">
            <div className="card p-4 shadow" style={{ width: '400px', maxWidth: '90%' }}>
                <h2 className="text-center mb-4">Iniciar Sesión</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
