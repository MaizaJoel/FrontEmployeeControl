import { Outlet } from 'react-router-dom';

const KioscoLayout = () => {
    return (
        <div
            className="d-flex align-items-center justify-content-center vh-100"
            style={{
                background: 'radial-gradient(circle at top left, #e0c3fc 0%, #8ec5fc 100%)',
                overflow: 'hidden'
            }}
        >
            {/* Contenedor centralizado para la pantalla del Kiosco */}
            <div className="w-100" style={{ maxWidth: '600px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default KioscoLayout;