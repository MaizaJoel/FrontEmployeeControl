import { useState, useEffect } from 'react';
import { Form, Button, Table, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { reporteService, ReporteNomina } from '../../services/reporteService';
import { empleadoService } from '../../services/empleadoService';
import { fichajeService } from '../../services/fichajeService';
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

    // Estado para edición inline de observaciones
    const [editingObservacion, setEditingObservacion] = useState<{ [key: number]: string }>({});

    // Helper para obtener adelantos de un día específico
    const getAdelantosDelDia = (fecha: string) => {
        if (!reporte) return [];
        return reporte.adelantos.filter(a => a.fechaSolicitud === fecha);
    };

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

    const fetchReport = async () => {
        if (selectedEmpId === 0) return;

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

    const handleGenerar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmpId === 0) {
            alert("Seleccione un empleado");
            return;
        }
        await fetchReport();
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

        const tableData = reporte.detallesDiarios.map((dia, idx) => {
            const adelantosDelDia = getAdelantosDelDia(dia.fecha);
            const totalAdelantosDelDia = adelantosDelDia.reduce((sum, a) => sum + a.monto, 0);
            const pagoExtras = (dia.minutosExtrasDiurnas / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8 * 1.5) +
                (dia.minutosExtrasNocturnas / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8 * 2);
            const deducciones = dia.minutosDeficit / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8;
            const netoDespuesAdelantos = dia.pagoNetoDia - totalAdelantosDelDia;
            const notasAdelantos = adelantosDelDia.map(a => a.descripcion).join('; ') || '-';

            return [
                dia.fecha,
                dia.horaEntrada || '-',
                dia.horaSalida || '-',
                `$${dia.pagoDiarioBase.toFixed(2)}`,
                `D:${Math.round(dia.minutosExtrasDiurnas)}m N:${Math.round(dia.minutosExtrasNocturnas)}m`,
                `$${pagoExtras.toFixed(2)}`,
                `$${deducciones.toFixed(2)}`,
                `$${dia.pagoNetoDia.toFixed(2)}`,
                `$${netoDespuesAdelantos.toFixed(2)}`,
                totalAdelantosDelDia > 0 ? `$${totalAdelantosDelDia.toFixed(2)}` : '-',
                notasAdelantos,
                editingObservacion[idx] || dia.observacion || '-'
            ];
        });

        autoTable(doc, {
            startY: 35,
            head: [['Fecha', 'Entrada', 'Salida', 'Pago Base', 'Extras', 'Pago Extras', 'Deducciones', 'Neto Diario', 'Neto-Adelantos', 'Adelanto', 'Nota', 'Observación']],
            body: tableData,
            foot: [['', '', '', '', '', '', '', '', 'TOTAL NETO:', `$${reporte.netoAPagar.toFixed(2)}`, '', '']],
            styles: { fontSize: 7 }
        });

        doc.save(`Nomina_${getNombreEmpleado()}.pdf`);
    };

    // --- EXPORTAR EXCEL ---
    const exportExcel = () => {
        if (!reporte) return;

        const data = reporte.detallesDiarios.map((dia, idx) => {
            const adelantosDelDia = getAdelantosDelDia(dia.fecha);
            const totalAdelantosDelDia = adelantosDelDia.reduce((sum, a) => sum + a.monto, 0);
            const pagoExtras = (dia.minutosExtrasDiurnas / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8 * 1.5) +
                (dia.minutosExtrasNocturnas / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8 * 2);
            const deducciones = dia.minutosDeficit / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8;
            const netoDespuesAdelantos = dia.pagoNetoDia - totalAdelantosDelDia;
            const notasAdelantos = adelantosDelDia.map(a => a.descripcion).join('; ') || '';

            return {
                Fecha: dia.fecha,
                Dia: dia.diaSemana,
                Entrada: dia.horaEntrada,
                Salida: dia.horaSalida,
                Pago_Base: dia.pagoDiarioBase,
                Extras_Diurnas_Min: dia.minutosExtrasDiurnas,
                Extras_Nocturnas_Min: dia.minutosExtrasNocturnas,
                Pago_Extras: pagoExtras,
                Deduccion_Min: dia.minutosDeficit,
                Deducciones: deducciones,
                Neto_Diario: dia.pagoNetoDia,
                Neto_Despues_Adelantos: netoDespuesAdelantos,
                Adelanto: totalAdelantosDelDia,
                Nota: notasAdelantos,
                Observacion: editingObservacion[idx] || dia.observacion || ''
            };
        });

        // Agregar fila de totales
        data.push({
            Fecha: 'TOTALES',
            Dia: '', Entrada: '', Salida: '',
            Pago_Base: 0,
            Extras_Diurnas_Min: 0, Extras_Nocturnas_Min: 0,
            Pago_Extras: 0,
            Deduccion_Min: 0,
            Deducciones: 0,
            Neto_Diario: reporte.totalIngresos,
            Neto_Despues_Adelantos: reporte.netoAPagar,
            Adelanto: reporte.totalDescuentosAdelantos,
            Nota: '',
            Observacion: ''
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
                            <Table hover className="mb-0 align-middle table-sm" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        <th className="text-end">Pago Base</th>
                                        <th>Extras (D/N)</th>
                                        <th className="text-end">Pago Extras</th>
                                        <th className="text-end">Deducciones</th>
                                        <th className="text-end">Neto Diario</th>
                                        <th className="text-end">Neto - Adelantos</th>
                                        <th className="text-end">Adelanto</th>
                                        <th style={{ minWidth: '150px' }}>Nota</th>
                                        <th style={{ minWidth: '150px' }}>Observación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reporte.detallesDiarios.map((dia, idx) => {
                                        const adelantosDelDia = getAdelantosDelDia(dia.fecha);
                                        const totalAdelantosDelDia = adelantosDelDia.reduce((sum, a) => sum + a.monto, 0);
                                        const pagoExtras = (dia.minutosExtrasDiurnas / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8 * 1.5) +
                                            (dia.minutosExtrasNocturnas / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8 * 2);
                                        const deducciones = dia.minutosDeficit / 60 * reporte.totalIngresos / reporte.detallesDiarios.length / 8;
                                        const netoDespuesAdelantos = dia.pagoNetoDia - totalAdelantosDelDia;

                                        return (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="fw-bold">{dia.fecha}</div>
                                                    <small className="text-muted">{dia.diaSemana}</small>
                                                </td>
                                                <td>{dia.horaEntrada || '-'}</td>
                                                <td>{dia.horaSalida || '-'}</td>
                                                <td className="text-end">${dia.pagoDiarioBase?.toFixed(2) || '0.00'}</td>
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
                                                <td className="text-end text-success">${pagoExtras.toFixed(2)}</td>
                                                <td className="text-end text-danger">${deducciones.toFixed(2)}</td>
                                                <td className="text-end fw-bold">${dia.pagoNetoDia.toFixed(2)}</td>
                                                <td className="text-end fw-bold text-primary">${netoDespuesAdelantos.toFixed(2)}</td>
                                                <td className="text-end">
                                                    {totalAdelantosDelDia > 0 ? `$${totalAdelantosDelDia.toFixed(2)}` : '-'}
                                                </td>
                                                <td style={{ maxWidth: '150px' }}>
                                                    {adelantosDelDia.length > 0 ? (
                                                        <small className="text-muted">
                                                            {adelantosDelDia.map(a => a.descripcion).join('; ')}
                                                        </small>
                                                    ) : '-'}
                                                </td>
                                                <td style={{ maxWidth: '150px' }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={editingObservacion[idx] !== undefined ? editingObservacion[idx] : dia.observacion || ''}
                                                        onChange={(e) => setEditingObservacion({ ...editingObservacion, [idx]: e.target.value })}
                                                        onKeyDown={async (e) => {
                                                            if (e.key === 'Enter') {
                                                                const newVal = editingObservacion[idx];
                                                                if (newVal === undefined) return; // No changes

                                                                try {
                                                                    await fichajeService.updateObservacion(reporte.idEmpleado, dia.fecha, newVal);
                                                                    // Refresh report to see saved changes
                                                                    await fetchReport();
                                                                    // Clear editing state for this row or keep it? 
                                                                    // Better to clear or update the initial value. report refresh will update dia.observacion
                                                                    const newEditing = { ...editingObservacion };
                                                                    delete newEditing[idx];
                                                                    setEditingObservacion(newEditing);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Error updating observation');
                                                                }
                                                            }
                                                        }}
                                                        placeholder="Click para añadir nota..."
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
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