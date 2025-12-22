import { useState, useEffect, useRef } from 'react';
import { Form, Card, Alert, Spinner } from 'react-bootstrap';
import { fichajeService } from '../../services/fichajeService';

const Kiosco = () => {
    const [cedula, setCedula] = useState('');
    const [hora, setHora] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger', texto: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Reloj en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Mantener el foco total
    useEffect(() => {
        const focusInput = () => {
            if (!loading) inputRef.current?.focus();
        };
        focusInput();
        // Listener para clics accidentales fuera
        window.addEventListener('click', focusInput);
        return () => window.removeEventListener('click', focusInput);
    }, [loading, mensaje]);

    // 3. Lógica central de Marcado
    const procesarMarcado = async (idParaMarcar: string) => {
        if (!idParaMarcar.trim() || idParaMarcar.length < 10 || loading) return;

        setLoading(true);
        setMensaje(null);

        try {
            const data = await fichajeService.marcar(idParaMarcar);
            setMensaje({ tipo: 'success', texto: data.message });
            setCedula(''); // Limpiar inmediatamente al éxito
        } catch (err: any) {
            const msg = err.response?.data?.Message || 'Error al registrar fichaje.';
            setMensaje({ tipo: 'danger', texto: msg });
            // Dejar la cédula un momento para que vean el error, luego limpiar
            setTimeout(() => setCedula(''), 2000);
        } finally {
            setLoading(false);
            // El mensaje desaparece después de un tiempo
            setTimeout(() => setMensaje(null), 4000);
        }
    };

    // 4. Auto-disparo al llegar a 10 dígitos
    useEffect(() => {
        if (cedula.length === 10) {
            procesarMarcado(cedula);
        }
    }, [cedula]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Solo dígitos
        if (val.length <= 10) {
            setCedula(val);
        }
    };

    return (
        <div className="kiosco-container pulse-soft">
            <Card className="kiosco-card border-0 animate-fade-in">
                <Card.Body className="p-5 text-center">
                    <div className="mb-2">
                        <i className="bi bi-clock-history fs-1 text-primary opacity-50"></i>
                    </div>

                    <h1 className="mb-4 fw-bold text-dark opacity-75">Control de Asistencia</h1>

                    {/* RELOJ PRO */}
                    <div className="mb-4">
                        <div className="clock-text display-1 d-block mb-1">
                            {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </div>
                        <div className="text-muted text-uppercase fw-semibold letter-spacing-widest">
                            {hora.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>

                    {/* ESTADO DINÁMICO */}
                    <div style={{ minHeight: '80px' }} className="d-flex align-items-center justify-content-center mb-4">
                        {loading ? (
                            <div className="animate-fade-in text-primary">
                                <Spinner animation="grow" role="status" className="me-2" />
                                <span className="fs-4 fw-bold">Procesando...</span>
                            </div>
                        ) : mensaje ? (
                            <Alert
                                variant={mensaje.tipo}
                                className={`w-100 fs-5 rounded-pill shadow-sm py-2 px-4 animate-fade-in border-0 ${mensaje.tipo === 'success' ? 'bg-success-light' : 'bg-danger-light'}`}
                            >
                                <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                                {mensaje.texto}
                            </Alert>
                        ) : (
                            <span className="text-muted fs-5 animate-fade-in">Pase su tarjeta o ingrese su cédula</span>
                        )
                        }
                    </div>

                    {/* INPUT GIGANTE */}
                    <Form.Group className="mb-2">
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            placeholder="0000000000"
                            className="text-center input-huge py-4 shadow-sm border-0 bg-light"
                            value={cedula}
                            onChange={handleInputChange}
                            disabled={loading}
                            autoComplete="off"
                            maxLength={10}
                        />
                    </Form.Group>

                    <div className="mt-5 d-flex justify-content-between align-items-center text-muted opacity-50 px-3">
                        <small><i className="bi bi-shield-check"></i> Seguro</small>
                        <small>RRHH System v2.0</small>
                        <small><i className="bi bi-wifi"></i> En línea</small>
                    </div>
                </Card.Body>
            </Card>

            {/* Estilos específicos si no están en index.css */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-success-light { background-color: rgba(25, 135, 84, 0.1) !important; color: #198754 !important; }
                .bg-danger-light { background-color: rgba(220, 53, 69, 0.1) !important; color: #dc3545 !important; }
                .letter-spacing-widest { letter-spacing: 3px; }
            `}} />
        </div>
    );
};

export default Kiosco;