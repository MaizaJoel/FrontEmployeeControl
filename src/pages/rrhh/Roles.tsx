import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { roleService, Role } from '../../services/roleService';

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    useEffect(() => { loadRoles(); }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await roleService.getAll();
            setRoles(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar roles.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await roleService.create({ name: newRoleName });
            setShowModal(false);
            setNewRoleName('');
            loadRoles();
        } catch (err: any) {
            console.error(err);
            alert('Error al crear rol: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (name === 'Admin' || name === 'Employee') {
            alert('No se pueden eliminar los roles del sistema.');
            return;
        }
        if (!confirm(`¿Eliminar rol ${name}?`)) return;
        
        try {
            await roleService.delete(id);
            loadRoles();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar rol.');
        }
    };

    return (
        <div className="container-fluid p-4 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">
                    <i className="bi bi-shield-lock me-2"></i>
                    Roles de Seguridad (Identity)
                </h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Nuevo Rol
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                <div className="card shadow-sm border-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((r) => (
                                <tr key={r.id}>
                                    <td><small className="text-muted">{r.id}</small></td>
                                    <td className="fw-bold">{r.name}</td>
                                    <td className="text-end">
                                        <Button variant="link" className="text-danger p-0" 
                                            onClick={() => handleDelete(r.id, r.name)}
                                            disabled={r.name === 'Admin' || r.name === 'Employee'}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nuevo Rol</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Nombre del Rol</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={newRoleName} 
                                onChange={(e) => setNewRoleName(e.target.value)} 
                                required 
                                autoFocus
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Roles;