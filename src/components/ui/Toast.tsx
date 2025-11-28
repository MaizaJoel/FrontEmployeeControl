import { useEffect } from 'react';
import { Alert } from 'react-bootstrap';

export interface ToastProps {
    show: boolean;
    message: string;
    variant?: 'success' | 'danger' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

const Toast = ({ show, message, variant = 'success', onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                minWidth: '300px',
                maxWidth: '500px',
            }}
            className="animate-fade-in"
        >
            <Alert
                variant={variant}
                onClose={onClose}
                dismissible
                className="shadow-lg mb-0"
            >
                {message}
            </Alert>
        </div>
    );
};

export default Toast;
