const Dashboard = () => {
    return (
        <div className="container-fluid mt-4">
            <h1 className="mb-4">Dashboard</h1>
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <div className="card card-hover h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                        <div className="card-body text-white d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 className="card-title text-white-50 text-uppercase small mb-1">Total Empleados</h6>
                                    <h2 className="fw-bold mb-0">150</h2>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="card-text text-white-50 mb-0 mt-auto">Empleados activos en el sistema</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card card-hover h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: 'none' }}>
                        <div className="card-body text-white d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 className="card-title text-white-50 text-uppercase small mb-1">Presentes Hoy</h6>
                                    <h2 className="fw-bold mb-0">120</h2>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M10.854 8.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="card-text text-white-50 mb-0 mt-auto">Empleados registrados hoy</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card card-hover h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none' }}>
                        <div className="card-body text-white d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 className="card-title text-white-50 text-uppercase small mb-1">Pendientes</h6>
                                    <h2 className="fw-bold mb-0">5</h2>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="card-text text-white-50 mb-0 mt-auto">Solicitudes pendientes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <h5 className="text-muted">Bienvenido al Sistema de Gestión de RRHH</h5>
                            <p className="text-muted mb-0">Utilice el menú lateral para navegar entre las diferentes secciones</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
