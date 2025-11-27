import { createContext, useState, useEffect } from 'react';

const TimezoneContext = createContext();

export const TimezoneProvider = ({ children }) => {
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    useEffect(() => {
        const savedTimezone = localStorage.getItem('timeDesk_timezone');
        if (savedTimezone) {
            setTimezone(savedTimezone);
        }
    }, []);

    const updateTimezone = (newTimezone) => {
        setTimezone(newTimezone);
        localStorage.setItem('timeDesk_timezone', newTimezone);
    };

    // Get all supported timezones from the browser
    const timezones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [
        // Fallback list if supportedValuesOf is not available (older browsers)
        'UTC',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'America/Halifax',
        'America/Toronto',
        'America/Denver',
        'America/Phoenix',
        'America/Anchorage',
        'America/Honolulu',
        'America/Sao_Paulo',
        'America/Mexico_City',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Europe/Rome',
        'Europe/Madrid',
        'Europe/Moscow',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Dubai',
        'Asia/Kolkata',
        'Asia/Hong_Kong',
        'Asia/Singapore',
        'Australia/Sydney',
        'Australia/Melbourne',
        'Pacific/Auckland',
    ];

    return (
        <TimezoneContext.Provider value={{ timezone, updateTimezone, timezones }}>
            {children}
        </TimezoneContext.Provider>
    );
};

export default TimezoneContext;
