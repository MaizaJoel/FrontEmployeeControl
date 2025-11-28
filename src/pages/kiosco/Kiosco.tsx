import { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { fichajeService } from '../../services/fichajeService';

const Kiosco = () => {
    const [cedula, setCedula] = useState('');
    const [hora, setHora] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Estados para mensajes
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger', texto: string } | null>(null);

    // Referencia para el input (para mantener el foco siempre)
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Reloj en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Auto-focus (para que siempre puedan escribir sin hacer clic)
    useEffect(() => {
        inputRef.current?.focus();
    }, [loading, mensaje]);

    const handleMarcar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cedula.trim()) return;

        setLoading(true);
        setMensaje(null);

        try {
            const data = await fichajeService.marcar(cedula);
            setMensaje({ tipo: 'success', texto: data.message });
            setCedula(''); // Limpiar campo
        } catch (err: any) {
            const msg = err.response?.data?.Message || 'Error al registrar fichaje.';
            setMensaje({ tipo: 'danger', texto: msg });
        } finally {
            setLoading(false);

            // Limpiar mensaje automáticamente después de 3 segundos
            setTimeout(() => setMensaje(null), 3000);
        }
    };

    return (
        <Card className="shadow-2xl border-0 glassmorphism animate-fade-in">
            <Card.Body className="p-5 text-center">
                <h2 className="mb-4 text-dark fw-bold">Control de Asistencia</h2>

                {/* RELOJ DIGITAL */}
                <div
                    className="display-1 fw-bold mb-4"
                    style={{
                        fontFamily: 'monospace',
                        color: '#667eea',
                        textShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                >
                    {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <h5 className="text-muted mb-4 fw-normal">
                    {hora.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h5>

                {/* ALERTAS */}
                {mensaje && (
                    <Alert variant={mensaje.tipo} className="animate-fade-in mb-4 shadow-sm">
                        <strong>{mensaje.tipo === 'success' ? '✓ ' : '✗ '}</strong>
                        {mensaje.texto}
                    </Alert>
                )}

                {/* FORMULARIO */}
                <Form onSubmit={handleMarcar}>
                    <Form.Group className="mb-4">
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            placeholder="Ingrese su Cédula"
                            className="text-center fs-3 p-3 shadow-sm"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            disabled={loading}
                            autoComplete="off"
                            maxLength={10}
                            style={{ borderRadius: '12px' }}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        className="w-100 fs-4 py-3 shadow"
                        disabled={loading || !cedula}
                        style={{
                            borderRadius: '12px',
                            background: loading ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            minHeight: '60px'
                        }}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" className="me-2" />
                                Procesando...
                            </>
                        ) : (
                            'MARCAR ASISTENCIA'
                        )}
                    </Button>
                </Form>

                <div className="mt-4 text-muted small">
                    Sistema RRHH v1.0
                </div>
            </Card.Body>
        </Card>
    );
};

export default Kiosco;