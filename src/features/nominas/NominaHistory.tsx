import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { nominaService, Nomina } from '../../services/nominaService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../shared/components/ui/ConfirmModal';
import Toast from '../../shared/components/ui/Toast';

const NominaHistory = () => {
    const [nominas, setNominas] = useState<Nomina[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNomina, setSelectedNomina] = useState<Nomina | null>(null);
    const { hasPermission } = useAuth();
    const canManage = hasPermission('Permissions.Payroll.Manage');

    // Estado para ConfirmModal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', variant: 'danger', onConfirm: () => { } });

    // Estado para Toast
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

    useEffect(() => {
        loadNominas();
    }, []);

    const loadNominas = async () => {
        setLoading(true);
        try {
            const data = await nominaService.getAll();
            setNominas(data);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error al cargar historial de nóminas.', variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id: number) => {
        try {
            const detail = await nominaService.getDetail(id);
            setSelectedNomina(detail);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error al cargar detalles.', variant: 'danger' });
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Anular Nómina',
            message: '¿Seguro que deseas ANULAR esta nómina?\n\n⚠️ ESTA ACCIÓN ES IRREVERSIBLE.\n\nLos adelantos descontados volverán a estado "Pagado" para que puedan ser descontados en una futura nómina.',
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await nominaService.delete(id);
                    loadNominas();
                    setToast({ show: true, message: 'Nómina anulada correctamente.', variant: 'success' });
                } catch (error) {
                    console.error(error);
                    setToast({ show: true, message: 'Error al anular la nómina.', variant: 'danger' });
                }
            }
        });
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold m-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Historial de Pagos (Nóminas)
                </h2>
                {canManage && (
                    <Link to="/rrhh/nominas/generar" className="btn btn-success">
                        <i className="bi bi-plus-lg me-2"></i>Generar Nueva Nómina
                    </Link>
                )}
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Table hover responsive className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Periodo</th>
                                <th className="text-center">Generado</th>
                                <th className="text-center">Empleados</th>
                                <th className="text-end">Total Pagado</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={6} className="text-center py-4">Cargando...</td></tr>
                            )}
                            {!loading && nominas.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-4 text-muted">No hay nóminas registradas.</td></tr>
                            )}
                            {nominas.map((n) => (
                                <tr key={n.idNomina}>
                                    <td className="fw-bold">
                                        {n.fechaInicio} <span className="text-muted mx-1">al</span> {n.fechaFin}
                                    </td>
                                    <td className="text-center">
                                        {new Date(n.fechaGeneracion).toLocaleDateString()}
                                    </td>
                                    <td className="text-center">
                                        <Badge bg="info" className="text-white rounded-pill px-3">
                                            {n.cantidadEmpleados}
                                        </Badge>
                                    </td>
                                    <td className="text-end text-success fw-bold">
                                        ${n.totalPagado.toFixed(2)}
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={n.estado === 'Cerrado' ? 'success' : 'warning'}>
                                            {n.estado}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleViewDetail(n.idNomina)}
                                        >
                                            <i className="bi bi-eye me-1"></i> Detalles
                                        </Button>
                                        {canManage && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                title="Anular Nómina"
                                                onClick={() => handleDelete(n.idNomina)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* MODAL DETALLE */}
            <Modal show={!!selectedNomina} onHide={() => setSelectedNomina(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de Nómina #{selectedNomina?.idNomina}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNomina && (
                        <div>
                            <div className="alert alert-info d-flex justify-content-between">
                                <span><strong>Periodo:</strong> {selectedNomina.fechaInicio} al {selectedNomina.fechaFin}</span>
                                <span><strong>Total:</strong> ${selectedNomina.totalPagado.toFixed(2)}</span>
                            </div>
                            <Table size="sm" striped>
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th className="text-end">Ingresos</th>
                                        <th className="text-end">Deducciones (Adelantos)</th>
                                        <th className="text-end">Neto Pagado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedNomina.detalles?.map(d => (
                                        <tr key={d.idNominaDetalle}>
                                            <td>
                                                {d.empleadoNavigation?.nombre ?
                                                    `${d.empleadoNavigation.nombre} ${d.empleadoNavigation.apellido}` :
                                                    `Empleado #${d.idEmpleado}`}
                                            </td>
                                            <td className="text-end text-success">${d.ingresosTotales.toFixed(2)}</td>
                                            <td className="text-end text-danger">${d.deduccionesTotales.toFixed(2)}</td>
                                            <td className="text-end fw-bold">${d.netoPagado.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedNomina(null)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
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

export default NominaHistory;
