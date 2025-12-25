import { Form, InputGroup, Button } from 'react-bootstrap';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = "Buscar..." }: SearchBarProps) => {
    return (
        <InputGroup className="mb-3">
            <InputGroup.Text className="bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border-start-0"
                style={{ boxShadow: 'none' }}
            />
            {value && (
                <Button
                    variant="outline-secondary"
                    className="border-start-0 border-end-1"
                    onClick={() => onChange('')}
                >
                    <i className="bi bi-x-lg"></i>
                </Button>
            )}
        </InputGroup>
    );
};

export default SearchBar;
