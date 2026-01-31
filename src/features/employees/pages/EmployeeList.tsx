import { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Alert, Form, OverlayTrigger, Tooltip, InputGroup, FormControl } from 'react-bootstrap';
import { empleadoService } from '../../../services/empleadoService';
import { authService } from '../../../services/authService';
import { Empleado } from '../../../types';
import EmpleadoModal from '../components/EmpleadoModal';
import { useDataFilter } from '../../../hooks/useDataFilter';
import SearchBar from '../../../shared/components/ui/SearchBar';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import NotificationModal from '../../../shared/components/ui/NotificationModal';
import Toast from '../../../shared/components/ui/Toast';

import { useAuth } from '../../../context/AuthContext';

const Empleados = () => {
    const { hasPermission } = useAuth();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
    const [resettingPassword, setResettingPassword] = useState<number | null>(null);

    // Estado para modal de contraseña temporal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [tempPasswordInfo, setTempPasswordInfo] = useState<{ password: string, email: string, warning?: string } | null>(null);
    const [copied, setCopied] = useState(false);

    // Estados para ConfirmModal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', variant: 'primary', onConfirm: () => { } });

    // Estado para Toast (mensajes de éxito rápidos)
    const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' | 'info' }>({
        show: false, message: '', variant: 'success'
    });

    // Estado para NotificationModal (errores importantes)
    const [notification, setNotification] = useState<{
        show: boolean;
        title?: string;
        message: string;
        variant: 'success' | 'danger' | 'warning' | 'info';
    }>({ show: false, message: '', variant: 'info' });

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

    const handleToggleStatus = (emp: Empleado) => {
        const newStatus = !emp.activo;
        const action = newStatus ? "Activar" : "Desactivar";

        setConfirmModal({
            show: true,
            title: `${action} Empleado`,
            message: `¿Deseas ${action.toLowerCase()} a ${emp.nombre} ${emp.apellido}?`,
            variant: newStatus ? 'primary' : 'warning',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                try {
                    await empleadoService.update(emp.idEmpleado, {
                        ...emp,
                        idCargo: emp.idCargo,
                        activo: newStatus
                    });
                    loadEmpleados();
                    setToast({ show: true, message: `Empleado ${action.toLowerCase()}do correctamente.`, variant: 'success' });
                } catch (err) {
                    setNotification({
                        show: true,
                        title: 'Error',
                        message: `Error al ${action.toLowerCase()} el empleado.`,
                        variant: 'danger'
                    });
                }
            }
        });
    };

    const handleResetPassword = (emp: Empleado) => {
        setConfirmModal({
            show: true,
            title: 'Restablecer Contraseña',
            message: `¿Enviar contraseña temporal a ${emp.nombre} ${emp.apellido}?\n\nCorreo: ${emp.email}`,
            variant: 'warning',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, show: false }));
                setResettingPassword(emp.idEmpleado);
                try {
                    const result = await authService.adminResetPassword(emp.email);

                    if (result.warning || result.tempPassword) {
                        setTempPasswordInfo({
                            password: result.tempPassword,
                            email: emp.email,
                            warning: result.warning
                        });
                        setCopied(false);
                        setShowPasswordModal(true);
                    } else {
                        setToast({ show: true, message: `Contraseña temporal enviada a ${emp.email}`, variant: 'success' });
                    }
                } catch (err: any) {
                    setNotification({
                        show: true,
                        title: 'Error',
                        message: 'Error al restablecer la contraseña.',
                        variant: 'danger'
                    });
                } finally {
                    setResettingPassword(null);
                }
            }
        });
    };

    const handleCopyPassword = () => {
        if (tempPasswordInfo?.password) {
            navigator.clipboard.writeText(tempPasswordInfo.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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

            {/* Modal de confirmación reutilizable */}
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />

            {/* Modal para mostrar contraseña temporal (con contenido copiable) */}
            <NotificationModal
                show={showPasswordModal}
                title={tempPasswordInfo?.warning ? 'Contraseña Restablecida' : 'Contraseña Restablecida'}
                message={tempPasswordInfo?.warning
                    ? `Nota: El correo no pudo ser enviado.\n${tempPasswordInfo.warning}\n\nLa contraseña ha sido restablecida para: ${tempPasswordInfo?.email}`
                    : `La contraseña ha sido restablecida para: ${tempPasswordInfo?.email}`
                }
                variant={tempPasswordInfo?.warning ? 'warning' : 'success'}
                onClose={() => setShowPasswordModal(false)}
            >
                <Form.Label className="fw-bold">Contraseña Temporal:</Form.Label>
                <InputGroup>
                    <FormControl
                        value={tempPasswordInfo?.password || ''}
                        readOnly
                        className="font-monospace fs-5 bg-light"
                    />
                    <Button
                        variant={copied ? 'success' : 'outline-primary'}
                        onClick={handleCopyPassword}
                    >
                        {copied ? '✓ Copiado' : '📋 Copiar'}
                    </Button>
                </InputGroup>
                <small className="text-muted mt-2 d-block">
                    Comunica esta contraseña al empleado de forma segura.
                </small>
            </NotificationModal>

            {/* Modal para notificaciones de error */}
            <NotificationModal
                show={notification.show}
                title={notification.title}
                message={notification.message}
                variant={notification.variant}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />

            {/* Toast para mensajes rápidos de éxito */}
            <Toast
                show={toast.show}
                message={toast.message}
                variant={toast.variant}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

export default Empleados;