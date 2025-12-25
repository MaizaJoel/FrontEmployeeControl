import { useState, useMemo } from 'react';

export function useDataFilter<T>(data: T[], searchKeys: (keyof T)[]) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;

        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(item =>
            searchKeys.some(key => {
                const value = item[key];
                return String(value).toLowerCase().includes(lowerQuery);
            })
        );
    }, [data, searchQuery, searchKeys]);

    return {
        searchQuery,
        setSearchQuery,
        filteredData
    };
}
