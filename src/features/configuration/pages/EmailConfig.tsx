import { useEffect, useState } from 'react';
import { Button, Form, Spinner, Alert, Card, InputGroup } from 'react-bootstrap';
import { configuracionService, Configuracion } from '../../../services/configuracionService';

const EmailConfig = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Mapeo local de valores
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpFromName, setSmtpFromName] = useState('');

    // IDs para actualización (si existen)
    const [configIds, setConfigIds] = useState<{[key: string]: number}>({});

    const [showPass, setShowPass] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await configuracionService.getAll();
            const mapping: {[key: string]: number} = {};
            
            data.forEach(c => {
                mapping[c.clave] = c.idConfiguracion;
                if (c.clave === 'SMTP_HOST') setSmtpHost(c.valor);
                if (c.clave === 'SMTP_PORT') setSmtpPort(c.valor);
                if (c.clave === 'SMTP_USER') setSmtpUser(c.valor);
                if (c.clave === 'SMTP_PASS') setSmtpPass(c.valor);
                if (c.clave === 'SMTP_FROM_NAME') setSmtpFromName(c.valor);
            });
            setConfigIds(mapping);
            
        } catch (error) { 
            console.error(error); 
            setError("Error cargando configuraciones");
        } finally { 
            setLoading(false); 
        }
    };

    const saveConfig = async (key: string, value: string, desc: string) => {
        const id = configIds[key];
        if (id) {
            await configuracionService.update(id, { idConfiguracion: id, clave: key, valor: value, descripcion: desc });
        } else {
            // Si no existe, crear (aunque el seeding debería haberlo creado)
            await configuracionService.create({ clave: key, valor: value, descripcion: desc });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await Promise.all([
                saveConfig('SMTP_HOST', smtpHost, 'Host SMTP del proveedor de correo'),
                saveConfig('SMTP_PORT', smtpPort, 'Puerto SMTP (ej. 587, 465)'),
                saveConfig('SMTP_USER', smtpUser, 'Usuario/Email SMTP'),
                saveConfig('SMTP_PASS', smtpPass, 'Contraseña SMTP'),
                saveConfig('SMTP_FROM_NAME', smtpFromName, 'Nombre que aparece en el remitente')
            ]);
            setSuccess('Configuración de correo guardada exitosamente.');
            // Recargar para obtener IDs si eran nuevos
            loadData();
        } catch (err) {
            console.error(err);
            setError('Error al guardar la configuración.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Card className="border-0 shadow-none">
            <Card.Body>
                <h5 className="mb-4">Configuración de Servidor de Correo (SMTP)</h5>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSave}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Host SMTP</Form.Label>
                                <Form.Control 
                                    value={smtpHost} 
                                    onChange={e => setSmtpHost(e.target.value)} 
                                    placeholder="smtp.hostinger.com"
                                    required
                                />
                                <Form.Text className="text-muted">Ej: smtp.hostinger.com</Form.Text>
                            </Form.Group>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Puerto SMTP</Form.Label>
                                <Form.Control 
                                    value={smtpPort} 
                                    onChange={e => setSmtpPort(e.target.value)} 
                                    placeholder="465"
                                    required
                                />
                                <Form.Text className="text-muted">Ej: 465 (SSL) o 587 (TLS)</Form.Text>
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Usuario / Email</Form.Label>
                                <Form.Control 
                                    value={smtpUser} 
                                    onChange={e => setSmtpUser(e.target.value)} 
                                    placeholder="info@freesias.ec"
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Contraseña</Form.Label>
                                <InputGroup>
                                    <Form.Control 
                                        type={showPass ? "text" : "password"}
                                        value={smtpPass} 
                                        onChange={e => setSmtpPass(e.target.value)} 
                                        placeholder="Ingrese la contraseña del correo"
                                        required
                                    />
                                    <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>
                                        {showPass ? 'Ocultar' : 'Mostrar'}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Form.Group>
                            <Form.Label>Nombre del Remitente</Form.Label>
                            <Form.Control 
                                value={smtpFromName} 
                                onChange={e => setSmtpFromName(e.target.value)} 
                                placeholder="Employee Control System"
                            />
                        </Form.Group>
                    </div>

                    <div className="d-flex justify-content-end">
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> : null}
                            Guardar Cambios
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default EmailConfig;
