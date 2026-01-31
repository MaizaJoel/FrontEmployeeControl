import { Modal, Button } from 'react-bootstrap';

export interface ConfirmModalProps {
    show: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({
    show,
    title = 'Confirmar',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary',
    loading = false,
    onConfirm,
    onCancel
}: ConfirmModalProps) => {
    const iconMap = {
        primary: '❓',
        danger: '⚠️',
        warning: '⚡'
    };

    const headerClass = {
        primary: '',
        danger: 'bg-danger text-white',
        warning: 'bg-warning'
    };

    return (
        <Modal show={show} onHide={onCancel} centered backdrop="static">
            <Modal.Header closeButton className={headerClass[variant]}>
                <Modal.Title>
                    <span className="me-2">{iconMap[variant]}</span>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm} disabled={loading}>
                    {loading ? 'Procesando...' : confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
