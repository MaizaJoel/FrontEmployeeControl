import { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

interface ClockData {
    hora: Date;
    formattedTime: string;
    formattedDate: string;
}

export const useClock = (): ClockData => {
    const { getConfig } = useConfig();
    const [hora, setHora] = useState(new Date());

    // Obtenemos la zona horaria configurada, fallback a la del sistema si falla
    const zonaHoraria = getConfig('ZONA_HORARIA_EMPRESA', Intl.DateTimeFormat().resolvedOptions().timeZone) as string;
    // Opcional: Podríamos tener una config para el LOCALE tabién (ej. 'es-MX', 'en-US')
    const locale = 'es-ES';

    useEffect(() => {
        const timer = setInterval(() => {
            // Creamos una fecha que representa "AHORA"
            const now = new Date();

            // Truco para "cambiar" la fecha a la zona horaria deseada sin librerías externas pesadas (como moment-timezone)
            // Convertimos a string en la zona destino y luego volvemos a Date
            const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: zonaHoraria }));

            setHora(timeInZone);
        }, 1000);
        return () => clearInterval(timer);
    }, [zonaHoraria]);

    const formattedTime = hora.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const formattedDate = hora.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return { hora, formattedTime, formattedDate };
};
