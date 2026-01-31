import { Modal, Button, Alert } from 'react-bootstrap';

export interface NotificationModalProps {
    show: boolean;
    title?: string;
    message: string;
    variant?: 'success' | 'danger' | 'warning' | 'info';
    onClose: () => void;
    /** Optional content to display (e.g., copyable text) */
    children?: React.ReactNode;
}

const NotificationModal = ({
    show,
    title,
    message,
    variant = 'info',
    onClose,
    children
}: NotificationModalProps) => {
    const iconMap = {
        success: '✅',
        danger: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const defaultTitles = {
        success: 'Éxito',
        danger: 'Error',
        warning: 'Advertencia',
        info: 'Información'
    };

    const headerClass = {
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
        warning: 'bg-warning',
        info: 'bg-info text-white'
    };

    const displayTitle = title || defaultTitles[variant];

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className={headerClass[variant]}>
                <Modal.Title>
                    <span className="me-2">{iconMap[variant]}</span>
                    {displayTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{message}</p>
                {children && (
                    <div className="mt-3">
                        {children}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NotificationModal;
