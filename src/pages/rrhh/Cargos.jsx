import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';

const Cargos = () => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1">
                <Navbar />
                <div className="container mt-4">
                    <h1>Cargos</h1>
                    <p>Gestión de cargos.</p>
                </div>
            </div>
        </div>
    );
};

export default Cargos;
