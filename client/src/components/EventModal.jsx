import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown } from 'react-icons/fi';
import TimezoneContext from '../context/TimezoneContext';
import { format, toZonedTime } from 'date-fns-tz';

const EventModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { timezone } = useContext(TimezoneContext);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Work',
        priority: 'Medium',
        date: '',
        time: '',
        description: '',
    });

    useEffect(() => {
        if (initialData) {
            // Format date to YYYY-MM-DD for input, using timezone to prevent off-by-one
            const eventDate = toZonedTime(new Date(initialData.date), timezone);
            const formattedDate = format(eventDate, 'yyyy-MM-dd', { timeZone: timezone });
            setFormData({ ...initialData, date: formattedDate });
        } else {
            // Use current date in user's timezone
            const today = toZonedTime(new Date(), timezone);
            const formattedDate = format(today, 'yyyy-MM-dd', { timeZone: timezone });
            setFormData({
                title: '',
                category: 'Work',
                priority: 'Medium',
                date: formattedDate,
                time: '',
                description: '',
            });
        }
    }, [initialData, isOpen, timezone]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-2xl shadow-2xl z-50 p-6 border border-slate-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                {initialData ? 'Edit Event' : 'New Event'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Event title"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                    >
                                        <option value="Work">Work</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Health">Health</option>
                                        <option value="Education">Education</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={(() => {
                                                    if (!formData.time) return '12';
                                                    let h = parseInt(formData.time.split(':')[0]);
                                                    h = h % 12;
                                                    return h ? h.toString() : '12';
                                                })()}
                                                onChange={(e) => {
                                                    const current = formData.time || '12:00';
                                                    let [h, m] = current.split(':');
                                                    let hour = parseInt(e.target.value);
                                                    const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
                                                    if (ampm === 'PM' && hour !== 12) hour += 12;
                                                    if (ampm === 'AM' && hour === 12) hour = 0;
                                                    setFormData({ ...formData, time: `${hour.toString().padStart(2, '0')}:${m}` });
                                                }}
                                                className="w-full px-4 py-2 appearance-none rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-slate-700 font-medium cursor-pointer"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                                <FiChevronDown size={16} />
                                            </div>
                                        </div>

                                        <div className="relative flex-1">
                                            <select
                                                value={formData.time ? formData.time.split(':')[1] : '00'}
                                                onChange={(e) => {
                                                    const current = formData.time || '12:00';
                                                    let [h] = current.split(':');
                                                    setFormData({ ...formData, time: `${h}:${e.target.value}` });
                                                }}
                                                className="w-full px-4 py-2 appearance-none rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-slate-700 font-medium cursor-pointer"
                                            >
                                                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                                <FiChevronDown size={16} />
                                            </div>
                                        </div>

                                        <div className="relative flex-1">
                                            <select
                                                value={(() => {
                                                    if (!formData.time) return 'AM';
                                                    return parseInt(formData.time.split(':')[0]) >= 12 ? 'PM' : 'AM';
                                                })()}
                                                onChange={(e) => {
                                                    const current = formData.time || '12:00';
                                                    let [h, m] = current.split(':');
                                                    let hour = parseInt(h);
                                                    const newAmpm = e.target.value;
                                                    if (newAmpm === 'PM' && hour < 12) hour += 12;
                                                    if (newAmpm === 'AM' && hour >= 12) hour -= 12;
                                                    setFormData({ ...formData, time: `${hour.toString().padStart(2, '0')}:${m}` });
                                                }}
                                                className="w-full px-4 py-2 appearance-none rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-slate-700 font-medium cursor-pointer"
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                                <FiChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="Add details..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    {initialData ? 'Save Changes' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EventModal;
