import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner } from 'react-bootstrap';
import { adelantoService, Adelanto, CreateAdelanto } from '../../services/adelantoService';
import AdelantoModal from '../../components/adelanto/AdelantoModal';

const Adelantos = () => {
    const [adelantos, setAdelantos] = useState<Adelanto[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingAdelanto, setEditingAdelanto] = useState<Adelanto | null>(null);

    useEffect(() => {
        loadAdelantos();
    }, []);

    const loadAdelantos = async () => {
        setLoading(true);
        try {
            const data = await adelantoService.getAll();
            setAdelantos(data);
        } catch (error) {
            console.error("Error loading adelantos", error);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---

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
            loadAdelantos();
        } catch (error) {
            alert("Error al guardar solicitud");
        }
    };

    const handleCambiarEstado = async (id: number, estado: string) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a: ${estado}?`)) return;
        try {
            await adelantoService.cambiarEstado(id, estado);
            loadAdelantos();
        } catch (error) {
            alert("Error al cambiar estado");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta solicitud? Solo es posible si está en estado 'Solicitado'.")) return;
        try {
            await adelantoService.delete(id);
            loadAdelantos();
        } catch (error) {
            alert("No se pudo eliminar. Verifica que el estado sea 'Solicitado'.");
        }
    };

    // Helper para color del badge
    const getBadgeColor = (estado: string) => {
        switch (estado) {
            case 'Aprobado': return 'success';
            case 'Rechazado': return 'danger';
            case 'Pagado': return 'dark';
            default: return 'warning'; // Solicitado
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Adelantos de Sueldo</h2>
                <Button variant="primary" onClick={handleCreate}>+ Nueva Solicitud</Button>
            </div>

            {loading ? <Spinner animation="border" /> : (
                <div className="card shadow-sm">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Empleado</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Descripción</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adelantos.map((item) => (
                                <tr key={item.idAdelanto}>
                                    <td>{item.fechaSolicitud}</td>
                                    <td className="fw-bold">{item.nombreEmpleado}</td>
                                    <td className="text-primary fw-bold">${item.monto.toFixed(2)}</td>
                                    <td>
                                        <Badge bg={getBadgeColor(item.estado)}>{item.estado}</Badge>
                                    </td>
                                    <td><small className="text-muted">{item.descripcion}</small></td>
                                    <td className="text-end">
                                        {/* SOLO mostrar acciones si NO está Pagado */}
                                        {item.estado !== 'Pagado' && (
                                            <>
                                                {item.estado === 'Solicitado' && (
                                                    <>
                                                        <Button
                                                            variant="outline-success" size="sm" className="me-1"
                                                            title="Aprobar"
                                                            onClick={() => handleCambiarEstado(item.idAdelanto, 'Aprobado')}
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary" size="sm" className="me-1"
                                                            title="Rechazar"
                                                            onClick={() => handleCambiarEstado(item.idAdelanto, 'Rechazado')}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="outline-primary" size="sm" className="me-1"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Editar
                                                </Button>

                                                {item.estado === 'Solicitado' && (
                                                    <Button
                                                        variant="outline-danger" size="sm"
                                                        onClick={() => handleDelete(item.idAdelanto)}
                                                    >
                                                        🗑️
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {adelantos.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-4 text-muted">No hay solicitudes</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            <AdelantoModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSave={handleSave}
                adelantoToEdit={editingAdelanto}
            />
        </div>
    );
};

export default Adelantos;