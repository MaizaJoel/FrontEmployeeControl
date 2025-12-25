import { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import { fichajeService } from '../../../services/fichajeService';
import { useConfig } from '../../../context/ConfigContext';

const PersonalClockIn = () => {
    const { user } = useAuth();
    const { getConfig } = useConfig();
    const [hora, setHora] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger', texto: string } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMarcar = async () => {
        if (!user?.username || loading) return;

        setLoading(true);
        setMensaje(null);

        try {
            // Usamos el username (cédula) del usuario logueado
            const data = await fichajeService.marcar(user.username);
            setMensaje({ tipo: 'success', texto: data.message });
        } catch (err: any) {
            const msg = err.response?.data?.Message || 'Error al registrar fichaje.';
            setMensaje({ tipo: 'danger', texto: msg });
        } finally {
            setLoading(false);
            // El mensaje desaparece después de un tiempo
            setTimeout(() => setMensaje(null), 5000);
        }
    };

    return (
        <div className="container py-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0 overflow-hidden animate-fade-in">
                        <div className="bg-primary p-4 text-center text-white">
                            <i className="bi bi-clock-history fs-1 mb-2"></i>
                            <h3 className="fw-bold mb-0">Control de Asistencia</h3>
                            <p className="opacity-75 mb-0">{getConfig('NOMBRE_EMPRESA', 'Sistema RRHH')}</p>
                        </div>

                        <Card.Body className="p-5 text-center">
                            <div className="mb-4">
                                <h1 className="display-3 fw-bold text-dark mb-1">
                                    {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </h1>
                                <div className="text-muted text-uppercase fw-semibold letter-spacing-widest">
                                    {hora.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                            </div>

                            <div className="alert alert-info border-0 shadow-sm mb-4">
                                <small className="d-block text-uppercase fw-bold opacity-75">Empleado</small>
                                <span className="fs-5 fw-semibold">{user?.fullName}</span>
                                <br />
                                <small className="text-muted">ID: {user?.username}</small>
                            </div>

                            {mensaje && (
                                <Alert variant={mensaje.tipo} className="animate-fade-in border-0 shadow-sm py-3 mb-4">
                                    <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                                    {mensaje.texto}
                                </Alert>
                            )}

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-100 py-3 shadow-sm rounded-pill hover-scale"
                                onClick={handleMarcar}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Registrando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-fingerprint me-2"></i>
                                        REGISTRAR MARCACIÓN
                                    </>
                                )
                                }
                            </Button>

                            <div className="mt-4 text-muted small">
                                <i className="bi bi-info-circle me-1"></i>
                                El sistema detectará automáticamente si es Entrada o Salida.
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: scale(1.02); }
                .letter-spacing-widest { letter-spacing: 2px; }
            ` }} />
        </div>
    );
};

export default PersonalClockIn;
