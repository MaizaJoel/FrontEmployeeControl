import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';

const Empleados = () => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1">
                <Navbar />
                <div className="container mt-4">
                    <h1>Empleados</h1>
                    <p>Gestión de empleados.</p>
                </div>
            </div>
        </div>
    );
};

export default Empleados;
