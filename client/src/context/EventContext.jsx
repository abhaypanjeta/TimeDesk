import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const getEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get('http://localhost:5000/api/events', config);
            setEvents(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const createEvent = async (eventData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.post('http://localhost:5000/api/events', eventData, config);
            setEvents([...events, data]);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updateEvent = async (id, eventData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.put(`http://localhost:5000/api/events/${id}`, eventData, config);
            setEvents(events.map((event) => (event._id === id ? data : event)));
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const deleteEvent = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.delete(`http://localhost:5000/api/events/${id}`, config);
            setEvents(events.filter((event) => event._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (event = null) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingEvent(null);
        setIsModalOpen(false);
    };

    return (
        <EventContext.Provider
            value={{
                events,
                loading,
                getEvents,
                createEvent,
                updateEvent,
                deleteEvent,
                isModalOpen,
                editingEvent,
                openModal,
                closeModal
            }}
        >
            {children}
        </EventContext.Provider>
    );
};

export default EventContext;
