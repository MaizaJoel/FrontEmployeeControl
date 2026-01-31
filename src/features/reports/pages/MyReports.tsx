import { useState, useEffect } from 'react';
import { Form, Button, Table, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { nominaService } from '../../../services/nominaService';
import { reporteService, ReporteNomina } from '../../../services/reporteService';
import { empleadoService } from '../../../services/empleadoService';
import { fichajeService } from '../../../services/fichajeService';
import { Empleado } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import EmployeeSelect from '../../employees/components/EmployeeSelect';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import NotificationModal from '../../../shared/components/ui/NotificationModal';
import Toast from '../../../shared/components/ui/Toast';

// Librerías para exportar
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Reportes = () => {
    const { hasPermission } = useAuth();
    // Listas y selección
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [selectedEmpId, setSelectedEmpId] = useState<number>(0);

    // Fechas (Default: Inicio y fin del mes actual)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [fechaInicio, setFechaInicio] = useState(firstDay);
    const [fechaFin, setFechaFin] = useState(lastDay);

    // Estado para ConfirmModal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', variant: 'warning', onConfirm: () => { } });

    // Estado para NotificationModal
    const [notification, setNotification] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'success' | 'danger' | 'warning' | 'info';
    }>({ show: false, title: '', message: '', variant: 'info' });

    // Estado para Toast
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

    // Esta función centraliza todos los cálculos derivados
    const procesarDatosDia = (dia: any) => {
        const adelantosDelDia = getAdelantosDelDia(dia.fecha);
        const totalAdelantosDelDia = adelantosDelDia.reduce((sum: number, a: any) => sum + a.monto, 0);

        // REUTILIZAMOS lo que calculó el Backend (evitamos discrepancias)
        const pagoExtras = dia.valorExtrasDiurnasPagables + dia.valorExtrasNocturnasPagables;
        const deducciones = dia.valorDeduccionesPagables;
        const netoDespuesAdelantos = dia.pagoNetoDia - totalAdelantosDelDia;
        const notasAdelantos = adelantosDelDia.map((a: any) => a.descripcion).join('; ') || '-';

        return {
            ...dia,
            totalAdelantosDelDia,
            pagoExtras,
            deducciones,
            netoDespuesAdelantos,
            notasAdelantos
        };
    };

    // Resultado
    const [reporte, setReporte] = useState<ReporteNomina | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado para edición inline de observaciones
    const [editingObservacion, setEditingObservacion] = useState<{ [key: number]: string }>({});
    const [dirtyObservaciones, setDirtyObservaciones] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Función para guardar todas las observaciones modificadas
    const saveAllObservaciones = async (): Promise<ReporteNomina | null> => {
        if (dirtyObservaciones.size === 0) return reporte;
        if (!reporte) return null;

        setIsSaving(true);
        const promises: Promise<any>[] = [];
        const dirtyIndices = Array.from(dirtyObservaciones);

        dirtyIndices.forEach(idx => {
            const dia = reporte.detallesDiarios[idx];
            const newVal = editingObservacion[idx];

            if (newVal !== undefined && newVal !== dia.observacion) {
                promises.push(
                    fichajeService.updateObservacion(
                        reporte.idEmpleado,
                        dia.fecha,
                        newVal
                    )
                );
            }
        });

        try {
            await Promise.all(promises);
            const updatedReport = await fetchReport(); // Refresh once after all saves

            // Solo limpiar lo que se guardó exitosamente
            setDirtyObservaciones(prev => {
                const next = new Set(prev);
                dirtyIndices.forEach(idx => next.delete(idx));
                return next;
            });
            setEditingObservacion(prev => {
                const next = { ...prev };
                dirtyIndices.forEach(idx => delete next[idx]);
                return next;
            });

            return updatedReport;
        } catch (err: any) {
            console.error('Error al guardar observaciones:', err);
            const msg = err.response?.data?.message || err.message || 'Error desconocido';
            setToast({ show: true, message: `Error al guardar observaciones: ${msg}`, variant: 'danger' });
            return null;
        } finally {
            setIsSaving(false);
        }
    };

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

    const fetchReport = async (): Promise<ReporteNomina | null> => {
        if (selectedEmpId === 0) return null;

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
            return data;
        } catch (err: any) {
            setError('Error al generar el reporte. Verifique que existan datos.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleGenerar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmpId === 0) {
            setToast({ show: true, message: 'Seleccione un empleado', variant: 'warning' });
            return;
        }
        await fetchReport();
    };

    // Helper para encontrar el nombre del empleado seleccionado
    const getNombreEmpleado = () => {
        const emp = empleados.find(e => e.idEmpleado === selectedEmpId);
        return emp ? `${emp.apellido} ${emp.nombre}` : '';
    };

    // Handler para registrar pago / cerrar periodo
    const handleRegistrarPago = () => {
        setConfirmModal({
            show: true,
            title: 'Registrar Pago',
            message: `¿Desea registrar este periodo como PAGADO?\n\nEsto marcará los adelantos como 'Descontado' y cerrará la nómina para ${getNombreEmpleado()}.`,
            variant: 'warning',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await nominaService.generar(fechaInicio, fechaFin, [selectedEmpId]);
                    setNotification({
                        show: true,
                        title: 'Nómina Registrada',
                        message: 'Nómina registrada exitosamente.',
                        variant: 'success'
                    });
                } catch (e: any) {
                    console.error(e);
                    const msg = e.response?.data || "Error al registrar pago.";
                    setToast({
                        show: true,
                        message: typeof msg === 'string' ? msg : "Error al procesar la solicitud.",
                        variant: 'danger'
                    });
                }
            }
        });
    };

    const handleNotificationClose = () => {
        setNotification(prev => ({ ...prev, show: false }));
        window.location.reload();
    };

    // --- EXPORTAR PDF ---
    const exportPDF = async () => {
        if (!reporte) return;

        let workingReport = reporte;
        // Auto-guardar cambios pendientes antes de exportar
        if (dirtyObservaciones.size > 0) {
            const savedReport = await saveAllObservaciones();
            if (!savedReport) return; // Si falló el guardado, no exportamos para evitar inconsistencias
            workingReport = savedReport;
        }
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Reporte de Nómina: ${getNombreEmpleado()}`, 14, 20);
        doc.setFontSize(11);
        doc.text(`Periodo: ${workingReport.fechaInicio} al ${workingReport.fechaFin}`, 14, 28);

        const tableData = workingReport.detallesDiarios.map((diaOriginal) => {
            // LLAMADA ÚNICA A LA VARIABLE REUTILIZABLE
            const datos = procesarDatosDia(diaOriginal);

            return [
                datos.fecha,
                datos.horaEntrada || '-',
                datos.horaSalida || '-',
                `$${datos.pagoDiarioBase.toFixed(2)}`,
                `D:${Math.round(datos.minutosExtrasDiurnas)}m N:${Math.round(datos.minutosExtrasNocturnas)}m`,
                `$${datos.pagoExtras.toFixed(2)}`,
                `$${datos.deducciones.toFixed(2)}`,
                `$${datos.pagoNetoDia.toFixed(2)}`,
                `$${datos.netoDespuesAdelantos.toFixed(2)}`,
                datos.totalAdelantosDelDia > 0 ? `$${datos.totalAdelantosDelDia.toFixed(2)}` : '-',
                datos.notasAdelantos,
                datos.observacion || '-'
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
    const exportExcel = async () => {
        if (!reporte) return;

        let workingReport = reporte;
        // Auto-guardar cambios pendientes antes de exportar
        if (dirtyObservaciones.size > 0) {
            const savedReport = await saveAllObservaciones();
            if (!savedReport) return;
            workingReport = savedReport;
        }

        const data = workingReport.detallesDiarios.map((diaOriginal) => {
            const datos = procesarDatosDia(diaOriginal);

            return {
                Fecha: datos.fecha,
                Dia: datos.diaSemana,
                Entrada: datos.horaEntrada,
                Salida: datos.horaSalida,
                Pago_Base: datos.pagoDiarioBase,
                Pago_Extras: datos.pagoExtras,
                Deducciones: datos.deducciones,
                Neto_Diario: datos.pagoNetoDia,
                Neto_Despues_Adelantos: datos.netoDespuesAdelantos,
                Adelanto: datos.totalAdelantosDelDia,
                Nota: datos.notasAdelantos,
                Observacion: datos.observacion || ''
            };
        });

        // Agregar fila de totales
        data.push({
            Fecha: 'TOTALES',
            Dia: '', Entrada: '', Salida: '',
            Pago_Base: 0,
            Pago_Extras: 0,
            Deducciones: 0,
            Neto_Diario: workingReport.totalIngresos,
            Neto_Despues_Adelantos: workingReport.netoAPagar,
            Adelanto: workingReport.totalDescuentosAdelantos,
            Nota: '',
            Observacion: ''
        });

        // Generar Excel con ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Nomina");

        // Definir columnas (headers)
        if (data.length > 0) {
            worksheet.columns = Object.keys(data[0]).map(key => ({
                header: key.replace(/_/g, ' '), // Reemplazar guiones bajos por espacios para header legible
                key: key,
                width: 15
            }));
        }

        // Agregar filas
        worksheet.addRows(data);

        // Estilo básico (opcional): Negrita para header
        worksheet.getRow(1).font = { bold: true };

        // Exportar
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `Nomina_${getNombreEmpleado()}.xlsx`);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Reporte de Nómina y Asistencia</h2>

            {/* --- FILTROS --- */}
            <Card className="shadow-sm mb-4" style={{ overflow: 'visible', position: 'relative', zIndex: 10 }}>
                <Card.Body>
                    <Form onSubmit={handleGenerar}>
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Empleado</Form.Label>
                                    <EmployeeSelect
                                        empleados={empleados}
                                        selectedId={selectedEmpId}
                                        onSelect={setSelectedEmpId}
                                    />
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
                            <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={saveAllObservaciones}
                                disabled={dirtyObservaciones.size === 0 || isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-1" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        Guardar Cambios
                                        {dirtyObservaciones.size > 0 && ` (${dirtyObservaciones.size})`}
                                    </>
                                )}
                            </Button>
                            {hasPermission('Permissions.Reports.Export') && (
                                <>
                                    <Button variant="success" size="sm" className="me-2" onClick={exportExcel}>Excel</Button>
                                    <Button variant="danger" size="sm" onClick={exportPDF}>PDF</Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* TARJETAS DE RESUMEN */}
                    {hasPermission('Permissions.Payroll.Manage') && (
                        <div className="d-flex justify-content-end mb-3">
                            <Button
                                variant="outline-primary"
                                onClick={handleRegistrarPago}
                            >
                                Registrar Pago / Cerrar Periodo
                            </Button>
                        </div>
                    )}

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
                                        const datos = procesarDatosDia(dia);

                                        return (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="fw-bold">{dia.fecha}</div>
                                                    <small className="text-muted">{dia.diaSemana}</small>
                                                </td>
                                                <td>{datos.horaEntrada || '-'}</td>
                                                <td>{datos.horaSalida || '-'}</td>
                                                <td className="text-end">${datos.pagoDiarioBase.toFixed(2)}</td>
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
                                                <td className="text-end text-success">${datos.pagoExtras.toFixed(2)}</td>
                                                <td className="text-end text-danger">${datos.deducciones.toFixed(2)}</td>
                                                <td className="text-end fw-bold">${datos.pagoNetoDia.toFixed(2)}</td>
                                                <td className="text-end fw-bold text-primary">${datos.netoDespuesAdelantos.toFixed(2)}</td>
                                                <td className="text-end">
                                                    {datos.totalAdelantosDelDia > 0 ? `$${datos.totalAdelantosDelDia.toFixed(2)}` : '-'}
                                                </td>
                                                <td style={{ maxWidth: '150px' }}>
                                                    {datos.notasAdelantos !== '-' ? (
                                                        <small className="text-muted">
                                                            {datos.notasAdelantos}
                                                        </small>
                                                    ) : '-'}
                                                </td>
                                                <td style={{ maxWidth: '150px' }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${dirtyObservaciones.has(idx) ? 'border-warning border-2' : ''}`}
                                                        value={editingObservacion[idx] !== undefined ? editingObservacion[idx] : dia.observacion || ''}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            setEditingObservacion(prev => ({ ...prev, [idx]: newValue }));
                                                            // Mark this observation as dirty
                                                            setDirtyObservaciones(prev => new Set(prev).add(idx));
                                                        }}
                                                        placeholder="Click para añadir nota..."
                                                        title={dirtyObservaciones.has(idx) ? 'Cambios sin guardar' : ''}
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

            {/* Modal de confirmación */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />

            {/* Modal de notificación */}
            <NotificationModal
                show={notification.show}
                title={notification.title}
                message={notification.message}
                variant={notification.variant}
                onClose={handleNotificationClose}
            />

            {/* Toast para mensajes */}
            <Toast
                show={toast.show}
                message={toast.message}
                variant={toast.variant}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default Reportes;