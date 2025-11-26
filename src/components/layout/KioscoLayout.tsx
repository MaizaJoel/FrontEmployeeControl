import { Outlet } from 'react-router-dom';

const KioscoLayout = () => {
    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-dark text-white">
            {/* Contenedor centralizado para la pantalla del Kiosco */}
            <div className="w-100" style={{ maxWidth: '600px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default KioscoLayout;