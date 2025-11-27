import { useState, useContext, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiCheckCircle, FiClock, FiCalendar, FiList } from 'react-icons/fi';
import EventContext from '../context/EventContext';
import AuthContext from '../context/AuthContext';
import EventModal from '../components/EventModal';
import ActionMenu from '../components/ActionMenu';
import { format, toZonedTime } from 'date-fns-tz';
import { motion } from 'framer-motion';
import TimezoneContext from '../context/TimezoneContext';

const Dashboard = () => {
    const { events, getEvents, updateEvent, deleteEvent, loading, openModal } = useContext(EventContext);
    const { user } = useContext(AuthContext);
    const { timezone } = useContext(TimezoneContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        getEvents();
    }, []);

    const handleDelete = async (id) => {
        await deleteEvent(id);
    };

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || event.category === filterCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        // First, sort by completion status (incomplete first, completed last)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        // Then sort by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
        }

        // Finally, sort by time
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return format(toZonedTime(date, timezone), 'h:mm a', { timeZone: timezone });
    };

    // Stats
    const totalTasks = events.length;
    const completedTasks = events.filter(e => e.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    const todayTasks = events.filter(e => {
        const eventDate = toZonedTime(new Date(e.date), timezone);
        const today = toZonedTime(new Date(), timezone);
        return format(eventDate, 'yyyy-MM-dd', { timeZone: timezone }) === format(today, 'yyyy-MM-dd', { timeZone: timezone });
    }).length;

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 min-h-screen bg-background">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        Dashboard
                        <button
                            onClick={() => openModal()}
                            className="bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            <FiPlus size={20} />
                        </button>
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">Here's what's happening today.</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                    <p className="text-xl md:text-2xl font-light text-slate-400">{format(toZonedTime(new Date(), timezone), 'EEEE', { timeZone: timezone })}</p>
                    <p className="text-slate-500 font-medium">{format(toZonedTime(new Date(), timezone), 'MMMM do, yyyy', { timeZone: timezone })}</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard title="Total Tasks" value={totalTasks} icon={FiList} color="bg-blue-100 text-blue-600" />
                <StatCard title="Completed" value={completedTasks} icon={FiCheckCircle} color="bg-green-100 text-green-600" />
                <StatCard title="Remaining" value={remainingTasks} icon={FiClock} color="bg-orange-100 text-orange-600" />
                <StatCard title="Today" value={todayTasks} icon={FiCalendar} color="bg-purple-100 text-purple-600" />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 placeholder:text-slate-400"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                    </select>
                </div>
            </div>

            {/* Event List */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-slate-500">Loading events...</p>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No events found. Create one to get started!</p>
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all ${event.completed ? 'opacity-60 bg-slate-50' : ''}`}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div
                                    onClick={() => updateEvent(event._id, { ...event, completed: !event.completed })}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 cursor-pointer transition-colors flex items-center justify-center ${event.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-primary'
                                        }`}
                                >
                                    {event.completed && <FiCheckCircle size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 md:gap-4">
                                        <div className="hidden md:flex w-10 h-10 rounded-lg bg-slate-50 flex-col items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 flex-shrink-0">
                                            <span>{format(toZonedTime(new Date(event.date), timezone), 'MMM', { timeZone: timezone })}</span>
                                            <span className="text-lg leading-none">{format(toZonedTime(new Date(event.date), timezone), 'd', { timeZone: timezone })}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className={`font-semibold text-slate-800 truncate ${event.completed ? 'line-through text-slate-500' : ''}`}>{event.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mt-1">
                                                <span className="md:hidden font-medium text-slate-600">{format(toZonedTime(new Date(event.date), timezone), 'MMM d', { timeZone: timezone })} • </span>
                                                <span>{formatTime(event.time)}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${event.priority === 'High' ? 'bg-red-100 text-red-600' :
                                                    event.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                    {event.priority}
                                                </span>
                                                <span className="hidden sm:inline">• {event.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Actions (Hover) */}
                            <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                <button
                                    onClick={() => openModal(event)}
                                    className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(event._id)}
                                    className="px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Mobile Actions (Menu) */}
                            <div className="md:hidden ml-2">
                                <ActionMenu
                                    onEdit={() => openModal(event)}
                                    onDelete={() => handleDelete(event._id)}
                                />
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
