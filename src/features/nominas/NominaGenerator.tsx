import { useState } from 'react';
import { Card, Button, Form, Table, Alert, Badge } from 'react-bootstrap';
import { nominaService, PayrollPreview } from '../../services/nominaService';
import { useNavigate } from 'react-router-dom';

const NominaGenerator = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Range Selection
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Step 2: Preview & Selection
    const [previewData, setPreviewData] = useState<PayrollPreview | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Check if period exists
            const check = await nominaService.checkPeriod(startDate, endDate);
            if (check.exists) {
                if (!window.confirm(`ATENCIÓN: Ya existe una nómina para el periodo ${startDate} - ${endDate} (Creada el ${check.nomina?.fechaGeneracion}). ¿Deseas continuar de todas formas y crear otra paralela?`)) {
                    setLoading(false);
                    return;
                }
            }

            const data = await nominaService.preview(startDate, endDate);
            setPreviewData(data);
            // Default select all
            setSelectedEmployees(data.detalles.map(d => d.idEmpleado));
            setStep(2);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data || "Error al calcular la previsualización de la nómina.";
            setError(typeof msg === 'string' ? msg : "Error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEmployee = (id: number) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter(e => e !== id));
        } else {
            setSelectedEmployees([...selectedEmployees, id]);
        }
    };

    const handleToggleAll = () => {
        if (previewData) {
            if (selectedEmployees.length === previewData.detalles.length) {
                setSelectedEmployees([]);
            } else {
                setSelectedEmployees(previewData.detalles.map(d => d.idEmpleado));
            }
        }
    };

    const handleGenerate = async () => {
        if (selectedEmployees.length === 0) return;

        if (!window.confirm(`¿Estás seguro de generar y cerrar la nómina para ${selectedEmployees.length} empleados? Esta acción descontará los adelantos automáticamente.`)) {
            return;
        }

        setLoading(true);
        try {
            await nominaService.generar(startDate, endDate, selectedEmployees);
            alert("¡Nómina generada exitosamente!");
            navigate('/rrhh/nominas');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data || "Error al guardar la nómina.";
            setError(typeof msg === 'string' ? msg : "Error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">
                    <i className="bi bi-cash-stack me-2"></i>
                    Generador de Nómina
                </h2>
                <Button variant="outline-secondary" onClick={() => navigate('/rrhh/nominas')}>
                    <i className="bi bi-arrow-left me-2"></i> Volver al Historial
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {step === 1 && (
                <Card className="shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                    <Card.Body className="p-4">
                        <h5 className="card-title mb-4">Paso 1: Seleccionar Periodo</h5>
                        <Form onSubmit={handlePreview}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Fecha Inicio</Form.Label>
                                        <Form.Control
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Fecha Fin</Form.Label>
                                        <Form.Control
                                            type="date"
                                            required
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="d-grid gap-2 mt-4">
                                <Button variant="primary" type="submit" disabled={loading} size="lg">
                                    {loading ? 'Calculando...' : 'Siguiente: Ver Previsualización'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {step === 2 && previewData && (
                <div className="animate__animated animate__fadeIn">
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="m-0">
                                    Paso 2: Confirmar Empleados y Montos
                                    <Badge bg="info" className="ms-2">Periodo: {startDate} al {endDate}</Badge>
                                </h5>
                                <div>
                                    <Button variant="outline-secondary" className="me-2" onClick={() => setStep(1)}>
                                        Atrás
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={handleGenerate}
                                        disabled={loading || selectedEmployees.length === 0}
                                    >
                                        {loading ? 'Procesando...' : `Generar Nómina (${selectedEmployees.length})`}
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="text-center" style={{ width: '50px' }}>
                                            <Form.Check
                                                checked={selectedEmployees.length === previewData.detalles.length}
                                                onChange={handleToggleAll}
                                            />
                                        </th>
                                        <th>Empleado</th>
                                        <th className="text-end">Ingresos Calc.</th>
                                        <th className="text-end">Adelantos (a descontar)</th>
                                        <th className="text-end">Neto a Pagar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.detalles.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-muted">No se encontraron datos para este periodo for los empleados activos.</td>
                                        </tr>
                                    )}
                                    {previewData.detalles.map(det => {
                                        const isSelected = selectedEmployees.includes(det.idEmpleado);
                                        return (
                                            <tr key={det.idEmpleado} className={isSelected ? 'table-active' : ''}>
                                                <td className="text-center">
                                                    <Form.Check
                                                        checked={isSelected}
                                                        onChange={() => handleToggleEmployee(det.idEmpleado)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{det.nombreEmpleado}</div>
                                                </td>
                                                <td className="text-end text-success">${det.ingresos.toFixed(2)}</td>
                                                <td className="text-end text-danger">
                                                    {det.deducciones > 0 ? `-$${det.deducciones.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="text-end fw-bold fs-6">
                                                    ${det.neto.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-light fw-bold">
                                    <tr>
                                        <td colSpan={2} className="text-end">Totales (Seleccionados):</td>
                                        <td className="text-end text-success">
                                            ${previewData.detalles.filter(d => selectedEmployees.includes(d.idEmpleado)).reduce((sum, d) => sum + d.ingresos, 0).toFixed(2)}
                                        </td>
                                        <td className="text-end text-danger">
                                            ${previewData.detalles.filter(d => selectedEmployees.includes(d.idEmpleado)).reduce((sum, d) => sum + d.deducciones, 0).toFixed(2)}
                                        </td>
                                        <td className="text-end">
                                            ${previewData.detalles.filter(d => selectedEmployees.includes(d.idEmpleado)).reduce((sum, d) => sum + d.neto, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default NominaGenerator;
