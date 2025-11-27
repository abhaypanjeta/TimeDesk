import { useState, useContext, useRef } from 'react';
import EventContext from '../context/EventContext';
import TimezoneContext from '../context/TimezoneContext';
import { format, toZonedTime } from 'date-fns-tz';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload } from 'react-icons/fi';

const DailyTable = () => {
    const { events } = useContext(EventContext);
    const { timezone } = useContext(TimezoneContext);
    const [sortBy, setSortBy] = useState('time'); // 'time' or 'priority'

    const today = toZonedTime(new Date(), timezone);
    const todayEvents = events.filter(event => {
        const eventDate = toZonedTime(new Date(event.date), timezone);
        return format(eventDate, 'yyyy-MM-dd', { timeZone: timezone }) === format(today, 'yyyy-MM-dd', { timeZone: timezone });
    }).sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
        }
        // Secondary sort by time (or primary if sortBy is 'time')
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });

    const formatTime = (time24) => {
        if (!time24) return '-';
        const [hours, minutes] = time24.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return format(toZonedTime(date, timezone), 'h:mm a', { timeZone: timezone });
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text(`Daily Schedule - ${format(today, 'MMMM do, yyyy', { timeZone: timezone })}`, 14, 22);

        // Table Data
        const tableBody = todayEvents.map(event => [
            formatTime(event.time),
            event.title,
            event.category,
            event.priority,
            event.completed ? 'Completed' : 'Pending'
        ]);

        autoTable(doc, {
            head: [['Time', 'Task', 'Category', 'Priority', 'Status']],
            body: tableBody,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [66, 133, 244] }, // Google Blue-ish
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 25 }, // Time
                1: { cellWidth: 'auto' }, // Task
                2: { cellWidth: 30 }, // Category
                3: { cellWidth: 25 }, // Priority
                4: { cellWidth: 25 }  // Status
            }
        });

        doc.save(`Daily_Schedule_${format(today, 'yyyy-MM-dd', { timeZone: timezone })}.pdf`);
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-background">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Daily Table</h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">{format(today, 'EEEE, MMMM do, yyyy', { timeZone: timezone })}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Sort Toggle */}
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex-1 md:flex-none justify-center">
                        <span className={`text-sm font-medium ${sortBy === 'time' ? 'text-slate-800' : 'text-slate-400'}`}>Time</span>
                        <button
                            onClick={() => setSortBy(prev => prev === 'time' ? 'priority' : 'time')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${sortBy === 'priority' ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${sortBy === 'priority' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-medium ${sortBy === 'priority' ? 'text-slate-800' : 'text-slate-400'}`}>Priority</span>
                    </div>

                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors font-medium shadow-sm flex-1 md:flex-none justify-center"
                    >
                        <FiDownload />
                        Export PDF
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-4 md:p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Tasks for Today</h2>
                {todayEvents.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No tasks scheduled for today.</p>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayEvents.map(event => (
                                        <tr key={event._id} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 text-slate-600 font-medium">{formatTime(event.time)}</td>
                                            <td className="py-3 px-4 text-slate-800 font-semibold">{event.title}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.priority === 'High' ? 'bg-red-100 text-red-600' :
                                                    event.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                    {event.priority}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {event.completed ? 'Completed' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {todayEvents.map(event => (
                                <div key={event._id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-semibold text-slate-800 text-lg ${event.completed ? 'line-through text-slate-500' : ''}`}>{event.title}</h3>
                                            <p className="text-slate-500 text-sm font-medium mt-1">{formatTime(event.time)}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${event.priority === 'High' ? 'bg-red-100 text-red-600' :
                                            event.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {event.priority}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600">
                                                {event.category}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.completed ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                                                {event.completed ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyTable;
