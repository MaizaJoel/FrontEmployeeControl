import React from 'react';

const Dashboard = () => {
    return (
        <div className="container mt-4">
            <h1>Dashboard</h1>
            <div className="row">
                <div className="col-md-4">
                    <div className="card text-white bg-primary mb-3">
                        <div className="card-header">Total Employees</div>
                        <div className="card-body">
                            <h5 className="card-title">150</h5>
                            <p className="card-text">Active employees in the system.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-success mb-3">
                        <div className="card-header">Present Today</div>
                        <div className="card-body">
                            <h5 className="card-title">120</h5>
                            <p className="card-text">Employees checked in today.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-warning mb-3">
                        <div className="card-header">Pending Requests</div>
                        <div className="card-body">
                            <h5 className="card-title">5</h5>
                            <p className="card-text">Leave requests pending approval.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;