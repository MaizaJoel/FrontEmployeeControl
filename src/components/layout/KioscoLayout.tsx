import { Outlet } from 'react-router-dom';

const KioscoLayout = () => {
    return (
        <div
            className="d-flex align-items-center justify-content-center vh-100 text-white"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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