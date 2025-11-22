import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { empleadoService } from '../../services/empleadoService';
import { Empleado } from '../../types';
import EmpleadoModal from '../../components/empleados/EmpleadoModal';

const Empleados = () => {
    // Estado de datos y carga
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado del Modal
    const [showModal, setShowModal] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);

    // Cargar empleados al montar el componente
    useEffect(() => {
        loadEmpleados();
    }, []);

    const loadEmpleados = async () => {
        setLoading(true);
        try {
            const data = await empleadoService.getAll();
            setEmpleados(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error al cargar empleados. Verifique que el backend esté activo.');
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJADORES DE ACCIONES ---

    const handleCreate = () => {
        setEditingEmpleado(null); // Modo Crear
        setShowModal(true);
    };

    const handleEdit = (emp: Empleado) => {
        setEditingEmpleado(emp); // Modo Editar
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar este empleado? Esta acción lo marcará como inactivo.')) return;

        try {
            await empleadoService.delete(id);
            loadEmpleados(); // Recargar la lista
        } catch (err) {
            alert('Error al eliminar el empleado.');
        }
    };

    const handleSave = async (empleadoData: Empleado) => {
        // Dejamos que el error "suba" para que el Modal lo capture.
        if (editingEmpleado) {
            const { idEmpleado, ...dataToUpdate } = empleadoData;
            await empleadoService.update(editingEmpleado.idEmpleado, dataToUpdate);
        } else {
            await empleadoService.create(empleadoData);
        }
        setShowModal(false);
        loadEmpleados();
    };

    return (
        <div className="container mt-4">
            {/* Encabezado */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Empleados</h2>
                <Button variant="primary" onClick={handleCreate}>
                    + Nuevo Empleado
                </Button>
            </div>

            {/* Mensaje de Error */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Tabla de Datos */}
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                <div className="card shadow-sm">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nombre Completo</th>
                                    <th>Cédula</th>
                                    <th>Cargo</th>
                                    <th>Contacto</th>
                                    <th>Estado</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empleados.map((emp) => (
                                    <tr key={emp.idEmpleado}>
                                        <td>
                                            <div className="fw-bold">{emp.apellido} {emp.nombre}</div>
                                        </td>
                                        <td>{emp.cedula}</td>
                                        <td>
                                            <Badge bg="info" text="dark" pill>
                                                {emp.nombreCargo || 'Sin Cargo'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <small className="d-block text-muted">{emp.email}</small>
                                            <small className="d-block text-muted">{emp.telefono || '-'}</small>
                                        </td>
                                        <td>
                                            {emp.activo ? (
                                                <Badge bg="success">Activo</Badge>
                                            ) : (
                                                <Badge bg="secondary">Inactivo</Badge>
                                            )}
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEdit(emp)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(emp.idEmpleado)}
                                            >
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {empleados.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">
                                            No hay empleados registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Modal de Formulario */}
            <EmpleadoModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSave={handleSave}
                empleadoToEdit={editingEmpleado}
            />
        </div>
    );
};

export default Empleados;