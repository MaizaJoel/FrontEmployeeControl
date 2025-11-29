import { useEffect, useState } from 'react';
import { Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { dashboardService, DashboardSummary } from '../../services/dashboardService';

const Dashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await dashboardService.getSummary();
            setSummary(data);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar la información del dashboard.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <div className="container mt-4"><Alert variant="danger">{error}</Alert></div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold text-secondary">Panel de Control</h2>

            <Row className="g-4">
                {/* Tarjeta 1: Empleados */}
                <Col md={4}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-primary">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2">Total Empleados</h6>
                                    <h2 className="display-4 fw-bold text-dark mb-0">{summary?.totalEmpleados}</h2>
                                </div>
                                <div className="text-primary opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                    </svg>
                                </div>
                            </div>
                            <small className="text-muted">Activos en el sistema</small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta 2: Asistencia */}
                <Col md={4}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-success">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2">Asistencias Hoy</h6>
                                    <h2 className="display-4 fw-bold text-dark mb-0">{summary?.asistenciasHoy}</h2>
                                </div>
                                <div className="text-success opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.79-.615c.248.312.472.646.668 1.002l-.805.41zm.993 2.208a7.035 7.035 0 0 0-.297-1.006l.97-.23a8.055 8.055 0 0 1 .61 1.297l-.952.338a6.993 6.993 0 0 0-.331-.399zm.28 2.676a7.01 7.01 0 0 0-.02-1.059l.996-.08c.03.366.03.735 0 1.103l-.996-.084a6.997 6.997 0 0 0 .02-.88zm-11.262 6.93a7.003 7.003 0 0 0 1.06.02L4.02 15a8.003 8.003 0 0 1-1.212-.023l.074-.997zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                    </svg>
                                </div>
                            </div>
                            <small className="text-muted">Empleados presentes</small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta 3: Pendientes */}
                <Col md={4}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-warning">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2">Solicitudes</h6>
                                    <h2 className="display-4 fw-bold text-dark mb-0">{summary?.solicitudesPendientes}</h2>
                                </div>
                                <div className="text-warning opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                    </svg>
                                </div>
                            </div>
                            <small className="text-muted">Adelantos por aprobar</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;