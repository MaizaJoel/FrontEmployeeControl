import { useState, useEffect } from 'react';
import { Form, Button, Table, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { reporteService, ReporteNomina } from '../../services/reporteService';
import { empleadoService } from '../../services/empleadoService';
import { Empleado } from '../../types';

// Librerías para exportar
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reportes = () => {
    // Listas y selección
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [selectedEmpId, setSelectedEmpId] = useState<number>(0);

    // Fechas (Default: Inicio y fin del mes actual)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [fechaInicio, setFechaInicio] = useState(firstDay);
    const [fechaFin, setFechaFin] = useState(lastDay);

    // Resultado
    const [reporte, setReporte] = useState<ReporteNomina | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEmpleados();
    }, []);

    const loadEmpleados = async () => {
        try {
            const data = await empleadoService.getAll();
            setEmpleados(data.filter(e => e.activo)); // Solo activos
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmpId === 0) {
            alert("Seleccione un empleado");
            return;
        }

        setLoading(true);
        setError('');
        setReporte(null);

        try {
            const data = await reporteService.getCalculo({
                idEmpleado: selectedEmpId,
                fechaInicio,
                fechaFin
            });
            setReporte(data);
        } catch (err: any) {
            setError('Error al generar el reporte. Verifique que existan datos.');
        } finally {
            setLoading(false);
        }
    };

    // Helper para encontrar el nombre del empleado seleccionado
    const getNombreEmpleado = () => {
        const emp = empleados.find(e => e.idEmpleado === selectedEmpId);
        return emp ? `${emp.apellido} ${emp.nombre}` : '';
    };

    // --- EXPORTAR PDF ---
    const exportPDF = () => {
        if (!reporte) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Reporte de Nómina: ${getNombreEmpleado()}`, 14, 20);
        doc.setFontSize(11);
        doc.text(`Periodo: ${reporte.fechaInicio} al ${reporte.fechaFin}`, 14, 28);

        const tableData = reporte.detallesDiarios.map(dia => [
            dia.fecha,
            dia.diaSemana,
            dia.horaEntrada || '-',
            dia.horaSalida || '-',
            `$${dia.pagoNetoDia.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Fecha', 'Día', 'Entrada', 'Salida', 'Pago Día']],
            body: tableData,
            foot: [['', '', '', 'TOTAL NETO:', `$${reporte.netoAPagar.toFixed(2)}`]]
        });

        doc.save(`Nomina_${getNombreEmpleado()}.pdf`);
    };

    // --- EXPORTAR EXCEL ---
    const exportExcel = () => {
        if (!reporte) return;

        const data = reporte.detallesDiarios.map(dia => ({
            Fecha: dia.fecha,
            Dia: dia.diaSemana,
            Entrada: dia.horaEntrada,
            Salida: dia.horaSalida,
            Extras_Diurnas_Min: dia.minutosExtrasDiurnas,
            Extras_Nocturnas_Min: dia.minutosExtrasNocturnas,
            Deduccion_Min: dia.minutosDeficit,
            Pago_Neto: dia.pagoNetoDia
        }));

        // Agregar fila de totales
        data.push({
            Fecha: 'TOTALES',
            Dia: '', Entrada: '', Salida: '',
            Extras_Diurnas_Min: 0, Extras_Nocturnas_Min: 0, Deduccion_Min: 0,
            Pago_Neto: reporte.totalIngresos
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Nomina");
        XLSX.writeFile(wb, `Nomina_${getNombreEmpleado()}.xlsx`);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Reporte de Nómina y Asistencia</h2>

            {/* --- FILTROS --- */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Form onSubmit={handleGenerar}>
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Empleado</Form.Label>
                                    <Form.Select
                                        value={selectedEmpId}
                                        onChange={e => setSelectedEmpId(Number(e.target.value))}
                                    >
                                        <option value={0}>Seleccione...</option>
                                        {empleados.map(e => (
                                            <option key={e.idEmpleado} value={e.idEmpleado}>
                                                {e.apellido} {e.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Desde</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={fechaInicio}
                                        onChange={e => setFechaInicio(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Hasta</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={fechaFin}
                                        onChange={e => setFechaFin(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                    {loading ? <Spinner size="sm" animation="border" /> : 'Generar'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* --- RESULTADOS --- */}
            {reporte && (
                <div className="animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-primary m-0">
                            Resultados para: <span className="fw-bold text-dark">{getNombreEmpleado()}</span>
                        </h4>
                        <div>
                            <Button variant="success" size="sm" className="me-2" onClick={exportExcel}>Excel</Button>
                            <Button variant="danger" size="sm" onClick={exportPDF}>PDF</Button>
                        </div>
                    </div>

                    {/* TARJETAS DE RESUMEN */}
                    <Row className="mb-4 text-center">
                        <Col md={4}>
                            <Card className="border-success h-100">
                                <Card.Body>
                                    <h6 className="text-success">TOTAL INGRESOS</h6>
                                    <h3>${reporte.totalIngresos.toFixed(2)}</h3>
                                    <small className="text-muted">Sueldo + Extras</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-danger h-100">
                                <Card.Body>
                                    <h6 className="text-danger">TOTAL DESCUENTOS</h6>
                                    <h3>${reporte.totalDescuentosAdelantos.toFixed(2)}</h3>
                                    <small className="text-muted">Adelantos solicitados</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="bg-primary text-white h-100 shadow">
                                <Card.Body>
                                    <h6>NETO A PAGAR</h6>
                                    <h2 className="fw-bold">${reporte.netoAPagar.toFixed(2)}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* TABLA DETALLADA */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light fw-bold">Detalle Diario</Card.Header>
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle table-sm" style={{ fontSize: '0.9rem' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        <th>Horas</th>
                                        <th>Extras (D/N)</th>
                                        <th>Observación</th>
                                        <th className="text-end">Pago ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reporte.detallesDiarios.map((dia, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="fw-bold">{dia.fecha}</div>
                                                <small className="text-muted">{dia.diaSemana}</small>
                                            </td>
                                            <td>{dia.horaEntrada || '-'}</td>
                                            <td>{dia.horaSalida || '-'}</td>
                                            <td>
                                                {(dia.minutosJornadaTotal / 60).toFixed(1)}h
                                            </td>
                                            <td>
                                                {dia.minutosExtrasDiurnas > 0 && (
                                                    <Badge bg="warning" text="dark" className="me-1" title="Extras Diurnas">
                                                        D: {Math.round(dia.minutosExtrasDiurnas)}m
                                                    </Badge>
                                                )}
                                                {dia.minutosExtrasNocturnas > 0 && (
                                                    <Badge bg="dark" className="me-1" title="Extras Nocturnas">
                                                        N: {Math.round(dia.minutosExtrasNocturnas)}m
                                                    </Badge>
                                                )}
                                                {dia.minutosDeficit > 0 && (
                                                    <Badge bg="danger" title="Atraso / Salida temprana">
                                                        -{Math.round(dia.minutosDeficit)}m
                                                    </Badge>
                                                )}
                                            </td>
                                            <td style={{ maxWidth: '200px' }} className="text-truncate" title={dia.logCalculo}>
                                                <small className="text-muted">{dia.logCalculo}</small>
                                            </td>
                                            <td className="text-end fw-bold">
                                                ${dia.pagoNetoDia.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Reportes;