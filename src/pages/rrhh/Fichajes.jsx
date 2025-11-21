import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';

const Fichajes = () => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1">
                <Navbar />
                <div className="container mt-4">
                    <h1>Fichajes</h1>
                    <p>Registro de fichajes.</p>
                </div>
            </div>
        </div>
    );
};

export default Fichajes;
