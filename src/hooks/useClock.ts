import { useState, useEffect } from 'react';

interface ClockData {
    hora: Date;
    formattedTime: string;
    formattedDate: string;
}

export const useClock = (): ClockData => {
    const [hora, setHora] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setHora(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = hora.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const formattedDate = hora.toLocaleDateString('es-EC', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return { hora, formattedTime, formattedDate };
};
