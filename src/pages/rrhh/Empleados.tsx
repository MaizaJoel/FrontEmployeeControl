import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Alert, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { empleadoService } from '../../services/empleadoService';
import { Empleado } from '../../types';
import EmpleadoModal from '../../components/empleados/EmpleadoModal';

const Empleados = () => {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);

    useEffect(() => { loadEmpleados(); }, []);

    const loadEmpleados = async () => {
        setLoading(true);
        try {
            const data = await empleadoService.getAll();
            setEmpleados(data);
            setError('');
        } catch (err) {
            setError('Error al cargar datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingEmpleado(null);
        setShowModal(true);
    };

    const handleEdit = (emp: Empleado) => {
        setEditingEmpleado(emp);
        setShowModal(true);
    };

    const handleToggleStatus = async (emp: Empleado) => {
        const newStatus = !emp.activo;
        const action = newStatus ? "Activar" : "Desactivar";

        if (!window.confirm(`¿Deseas ${action} a ${emp.nombre}?`)) return;

        try {
            // We use the update endpoint to flip the status
            await empleadoService.update(emp.idEmpleado, {
                ...emp,
                idCargo: emp.idCargo, // Required by DTO
                activo: newStatus
            });
            loadEmpleados();
        } catch (err) {
            alert(`Error al ${action.toLowerCase()} el empleado.`);
        }
    };

    const handleSave = async (empleadoData: Empleado) => {
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Empleados</h2>
                <Button variant="primary" onClick={handleCreate}>+ Nuevo Empleado</Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <div className="card shadow-sm">
                    <Table hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nombre Completo</th>
                                <th>Cédula</th>
                                <th>Cargo</th>
                                <th>Contacto</th>
                                <th>Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleados.map((emp) => (
                                <tr key={emp.idEmpleado} className={!emp.activo ? "bg-light text-muted" : ""}>
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
                                        <small className="d-block">{emp.email}</small>
                                        <small>{emp.telefono || '-'}</small>
                                    </td>
                                    <td>
                                        {/* Status Switch */}
                                        <Form.Check
                                            type="switch"
                                            id={`switch-${emp.idEmpleado}`}
                                            checked={emp.activo}
                                            onChange={() => handleToggleStatus(emp)}
                                            label={emp.activo ? "Activo" : "Inactivo"}
                                            className={emp.activo ? "text-success fw-bold" : "text-secondary"}
                                        />
                                    </td>
                                    <td className="text-center">
                                        {/* Pencil Icon with Tooltip */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>Editar Empleado</Tooltip>}
                                        >
                                            <Button
                                                variant="link"
                                                className="text-primary p-0 me-2"
                                                onClick={() => handleEdit(emp)}
                                            >
                                                {/* SVG Pencil Icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                                </svg>
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

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