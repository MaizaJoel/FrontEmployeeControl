interface LoadingSkeletonProps {
    variant?: 'card' | 'table' | 'list';
    count?: number;
}

const LoadingSkeleton = ({ variant = 'list', count = 3 }: LoadingSkeletonProps) => {
    if (variant === 'card') {
        return (
            <div className="row">
                {Array.from({ length: count }).map((_, idx) => (
                    <div key={idx} className="col-md-4 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }}></div>
                                <div className="skeleton" style={{ height: '48px', width: '40%', marginBottom: '8px' }}></div>
                                <div className="skeleton" style={{ height: '16px', width: '80%' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'table') {
        return (
            <div className="card">
                <div className="table-responsive">
                    <table className="table mb-0">
                        <thead>
                            <tr>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <th key={idx}>
                                        <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: count }).map((_, rowIdx) => (
                                <tr key={rowIdx}>
                                    {Array.from({ length: 5 }).map((_, colIdx) => (
                                        <td key={colIdx}>
                                            <div className="skeleton" style={{ height: '16px', width: '90%' }}></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Default: list variant
    return (
        <div>
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="card mb-3">
                    <div className="card-body">
                        <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '8px' }}></div>
                        <div className="skeleton" style={{ height: '16px', width: '90%' }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
