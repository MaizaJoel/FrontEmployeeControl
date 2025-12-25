import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner } from 'react-bootstrap';
import { adelantoService, Adelanto, CreateAdelanto } from '../../../services/adelantoService';
import AdelantoModal from '../components/adelantos/AdelantoModal';
import { useAuth } from '../../../context/AuthContext';

const Adelantos = () => {
    const { hasPermission } = useAuth();
    const canManage = hasPermission('Permissions.Advances.Manage');

    const [adelantos, setAdelantos] = useState<Adelanto[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingAdelanto, setEditingAdelanto] = useState<Adelanto | null>(null);

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
        if (editingAdelanto) {
            await adelantoService.update(editingAdelanto.idAdelanto, data);
        } else {
            await adelantoService.create(data);
        }
        setShowModal(false);
        loadData();
    };

    const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
        // Si ya está en ese estado, no hacemos nada
        if (!confirm(`¿Cambiar estado a: ${nuevoEstado}?`)) return;
        try {
            await adelantoService.cambiarEstado(id, nuevoEstado);
            loadData();
        } catch (err) {
            alert('Error al cambiar el estado.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta solicitud permanentemente?")) return;
        try {
            await adelantoService.delete(id);
            loadData();
        } catch (err: any) {
            const msg = err.response?.data?.Message || err.response?.data?.message || 'No se pudo eliminar.';
            alert(`Error: ${msg}`);
        }
    };

    const getBadge = (estado: string) => {
        switch (estado) {
            case 'Aprobado': return 'success';
            case 'Rechazado': return 'danger';
            case 'Pagado': return 'dark';
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

                                        {/* Solo permitimos acciones si NO está Pagado */}
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
        </div>
    );
};

export default Adelantos;