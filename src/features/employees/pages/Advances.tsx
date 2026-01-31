import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner } from 'react-bootstrap';
import { adelantoService, Adelanto, CreateAdelanto } from '../../../services/adelantoService';
import AdelantoModal from '../components/adelantos/AdelantoModal';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import Toast from '../../../shared/components/ui/Toast';

const Adelantos = () => {
    const { hasPermission } = useAuth();
    const canManage = hasPermission('Permissions.Advances.Manage');

    const [adelantos, setAdelantos] = useState<Adelanto[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingAdelanto, setEditingAdelanto] = useState<Adelanto | null>(null);

    // Estado para ConfirmModal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', variant: 'warning', onConfirm: () => { } });

    // Estado para Toast
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await adelantoService.getAll();
            setAdelantos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAdelanto(null);
        setShowModal(true);
    };

    const handleEdit = (item: Adelanto) => {
        setEditingAdelanto(item);
        setShowModal(true);
    };

    const handleSave = async (data: CreateAdelanto) => {
        try {
            if (editingAdelanto) {
                await adelantoService.update(editingAdelanto.idAdelanto, data);
            } else {
                await adelantoService.create(data);
            }
            setShowModal(false);
            loadData();
            setToast({ show: true, message: 'Adelanto guardado correctamente.', variant: 'success' });
        } catch (err: any) {
            // Manejar errores de validación del backend
            const errorData = err.response?.data;
            let msg = 'Error al guardar el adelanto.';

            if (errorData?.errors) {
                // Extraer mensajes de validación
                const validationErrors = Object.values(errorData.errors).flat().join(', ');
                msg = validationErrors || msg;
            } else if (typeof errorData === 'string') {
                msg = errorData;
            } else if (errorData?.message) {
                msg = errorData.message;
            }

            setToast({ show: true, message: msg, variant: 'danger' });
        }
    };

    const handleCambiarEstado = (id: number, nuevoEstado: string) => {
        setConfirmModal({
            show: true,
            title: 'Cambiar Estado',
            message: `¿Cambiar estado a: ${nuevoEstado}?`,
            variant: 'warning',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await adelantoService.cambiarEstado(id, nuevoEstado);
                    loadData();
                    setToast({ show: true, message: `Estado cambiado a ${nuevoEstado}.`, variant: 'success' });
                } catch (err) {
                    setToast({ show: true, message: 'Error al cambiar el estado.', variant: 'danger' });
                }
            }
        });
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Adelanto',
            message: '¿Eliminar esta solicitud permanentemente?',
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await adelantoService.delete(id);
                    loadData();
                    setToast({ show: true, message: 'Adelanto eliminado correctamente.', variant: 'success' });
                } catch (err: any) {
                    const msg = err.response?.data?.Message || err.response?.data?.message || 'No se pudo eliminar.';
                    setToast({ show: true, message: `Error: ${msg}`, variant: 'danger' });
                }
            }
        });
    };

    const getBadge = (estado: string) => {
        switch (estado) {
            case 'Aprobado': return 'success';
            case 'Rechazado': return 'danger';
            case 'Pagado': return 'dark';
            case 'Descontado': return 'info';
            default: return 'warning';
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Adelantos de Sueldo</h2>
                {canManage && (
                    <Button variant="primary" onClick={handleCreate}>+ Nueva Solicitud</Button>
                )}
            </div>

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <div className="card shadow-sm">
                    <Table hover responsive className="mb-0 align-middle table-nowrap">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Empleado</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Motivo</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adelantos.map((item) => (
                                <tr key={item.idAdelanto}>
                                    <td>{item.fechaSolicitud}</td>
                                    <td className="fw-bold">{item.nombreEmpleado}</td>
                                    <td className="text-primary fw-bold">${item.monto.toFixed(2)}</td>
                                    <td><Badge bg={getBadge(item.estado)}>{item.estado}</Badge></td>
                                    <td><small className="text-muted">{item.descripcion}</small></td>

                                    <td className="text-end">

                                        {/* SI ESTÁ DESCONTADO: Bloqueamos todo y explicamos por qué */}
                                        {item.estado === 'Descontado' ? (
                                            <span className="text-muted small italic">
                                                <i className="bi bi-lock-fill me-1"></i>
                                                Deducido en nómina
                                            </span>
                                        ) : (
                                            <>
                                                {/* Solo permitimos acciones si NO está Pagado ni Descontado */}
                                                {item.estado !== 'Pagado' && (
                                                    <>
                                                        {/* Aprobar: Solo si no está aprobado aún */}
                                                        {item.estado !== 'Aprobado' && (
                                                            <Button variant="outline-success" size="sm" className="me-1" title="Aprobar Adelanto"
                                                                onClick={() => handleCambiarEstado(item.idAdelanto, 'Aprobado')}>✓</Button>
                                                        )}

                                                        {/* Rechazar: Siempre visible (para cancelar aprobaciones) */}
                                                        {item.estado !== 'Rechazado' && (
                                                            <Button variant="outline-secondary" size="sm" className="me-1" title="Rechazar / Cancelar"
                                                                onClick={() => handleCambiarEstado(item.idAdelanto, 'Rechazado')}>✕</Button>
                                                        )}

                                                        {/* Editar: Siempre visible (corregir montos) */}
                                                        <Button variant="outline-primary" size="sm" className="me-1" title="Editar Adelanto"
                                                            onClick={() => handleEdit(item)}>✏️</Button>

                                                        {/* AHORA: Mostramos el botón si es Solicitado O Rechazado */}
                                                        {(item.estado === 'Solicitado' || item.estado === 'Rechazado') && (
                                                            <Button variant="outline-danger" size="sm"
                                                                onClick={() => handleDelete(item.idAdelanto)}
                                                                title="Eliminar adelanto">🗑️</Button>
                                                        )}
                                                    </>
                                                )}

                                                {/* Si está Pagado pero NO Descontado aún, permitimos registrar el descuento manual o simplemente informamos */}
                                                {item.estado === 'Pagado' && (
                                                    <span className="text-muted small">
                                                        Pendiente de deducción
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {adelantos.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted">No hay solicitudes.</td></tr>}
                        </tbody>
                    </Table>
                </div>
            )}

            <AdelantoModal
                show={showModal} handleClose={() => setShowModal(false)}
                handleSave={handleSave} adelantoToEdit={editingAdelanto}
            />

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

export default Adelantos;