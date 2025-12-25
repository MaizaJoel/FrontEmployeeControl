import { useState, useEffect, useRef } from 'react';
import { Form, ListGroup, Card } from 'react-bootstrap';
import { Empleado } from '../../../types';
import { useDataFilter } from '../../../hooks/useDataFilter';

interface EmployeeSelectProps {
    empleados: Empleado[];
    selectedId: number;
    onSelect: (id: number) => void;
    placeholder?: string;
}

const EmployeeSelect = ({ empleados, selectedId, onSelect, placeholder = 'Buscar empleado...' }: EmployeeSelectProps) => {
    // Determine initial display value
    const selectedEmp = empleados.find(e => e.idEmpleado === selectedId);

    // We want the search query to be independent so the user can type freely
    const [inputValue, setInputValue] = useState(selectedEmp ? `${selectedEmp.apellido} ${selectedEmp.nombre}` : '');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Use our hook to filter based on the *current input value*
    // We only filter if the input doesn't exactly match the selected employee (to allow searching again)
    const { setSearchQuery, filteredData } = useDataFilter(empleados, ['nombre', 'apellido', 'cedula']);

    // Update internal input when external selection changes
    useEffect(() => {
        if (selectedEmp) {
            setInputValue(`${selectedEmp.apellido} ${selectedEmp.nombre}`);
        } else if (selectedId === 0) {
            setInputValue('');
        }
    }, [selectedEmp, selectedId]);

    useEffect(() => {
        // Trigger filter
        setSearchQuery(inputValue);
    }, [inputValue, setSearchQuery]);

    // Ref for detecting clicks outside
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (emp: Empleado) => {
        onSelect(emp.idEmpleado);
        setInputValue(`${emp.apellido} ${emp.nombre}`);
        setShowSuggestions(false);
    };

    const handleClear = () => {
        onSelect(0);
        setInputValue('');
        setSearchQuery('');
    };

    return (
        <div className="position-relative" ref={containerRef}>
            <div className="d-flex">
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                        if (e.target.value === '') onSelect(0);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                // onBlur removed in favor of click-outside
                />
                {(selectedId !== 0 || inputValue) && (
                    <button
                        className="btn btn-outline-secondary border-start-0"
                        style={{ marginLeft: '-40px', zIndex: 5, border: 'none', background: 'transparent' }}
                        onClick={handleClear}
                        type="button"
                    >
                        ✕
                    </button>
                )}
            </div>

            {showSuggestions && inputValue && filteredData.length > 0 && (
                <Card className="position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                    <ListGroup variant="flush">
                        {filteredData.map(emp => (
                            <ListGroup.Item
                                key={emp.idEmpleado}
                                action
                                onClick={() => handleSelect(emp)}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{emp.apellido} {emp.nombre}</strong>
                                    <br />
                                    <small className="text-muted">{emp.cedula}</small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            )}
        </div>
    );
};

export default EmployeeSelect;
