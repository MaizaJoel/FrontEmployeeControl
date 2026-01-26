import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Alert, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { empleadoService } from '../../../services/empleadoService';
import { authService } from '../../../services/authService';
import { Empleado } from '../../../types';
import EmpleadoModal from '../components/EmpleadoModal';
import { useDataFilter } from '../../../hooks/useDataFilter';
import SearchBar from '../../../shared/components/ui/SearchBar';

import { useAuth } from '../../../context/AuthContext';

const Empleados = () => {
    const { hasPermission } = useAuth();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
    const [resettingPassword, setResettingPassword] = useState<number | null>(null);

    const { searchQuery, setSearchQuery, filteredData } = useDataFilter(empleados, ['nombre', 'apellido', 'cedula', 'email']);

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

    const handleResetPassword = async (emp: Empleado) => {
        if (!window.confirm(`¿Enviar contraseña temporal a ${emp.nombre} ${emp.apellido} (${emp.email})?`)) return;

        setResettingPassword(emp.idEmpleado);
        try {
            await authService.adminResetPassword(emp.email);
            alert(`Contraseña temporal enviada a ${emp.email}`);
        } catch (err) {
            alert('Error al restablecer la contraseña.');
        } finally {
            setResettingPassword(null);
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
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ maxWidth: '300px' }}>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar empleado..." />
                </div>
                {hasPermission('Permissions.Employees.Create') && (
                    <Button variant="primary" onClick={handleCreate}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                        Nuevo Empleado
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <div className="card shadow-sm">
                    <Table hover responsive className="mb-0 align-middle table-nowrap">
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
                            {filteredData.map((emp) => (
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
                                        {hasPermission('Permissions.Employees.Edit') && (
                                            <Form.Check
                                                type="switch"
                                                id={`switch-${emp.idEmpleado}`}
                                                checked={emp.activo}
                                                onChange={() => handleToggleStatus(emp)}
                                                label={emp.activo ? "Activo" : "Inactivo"}
                                                className={`mb-2 ${emp.activo ? "text-success fw-bold" : "text-secondary"}`}
                                            />
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {/* Pencil Icon with Tooltip */}
                                        {hasPermission('Permissions.Employees.Edit') && (
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>Editar Empleado</Tooltip>}
                                            >
                                                <Button
                                                    variant="link"
                                                    className="text-primary p-0 me-2"
                                                    title="Editar"
                                                    onClick={() => handleEdit(emp)}
                                                > ✏️
                                                </Button>
                                            </OverlayTrigger>
                                        )}
                                        {/* Password Reset Icon with Tooltip */}
                                        {hasPermission('Permissions.Employees.ResetPassword') && (
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>Restablecer Contraseña</Tooltip>}
                                            >
                                                <Button
                                                    variant="link"
                                                    className="text-warning p-0"
                                                    title="Restablecer Contraseña"
                                                    onClick={() => handleResetPassword(emp)}
                                                    disabled={resettingPassword === emp.idEmpleado}
                                                > {resettingPassword === emp.idEmpleado ? '⏳' : '🔑'}
                                                </Button>
                                            </OverlayTrigger>
                                        )}
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