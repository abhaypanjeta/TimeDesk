import { useState, useContext, useRef } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, addDays } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import EventContext from '../context/EventContext';
import TimezoneContext from '../context/TimezoneContext';
import { format, toZonedTime } from 'date-fns-tz';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Calendar = () => {
    const { events } = useContext(EventContext);
    const { timezone } = useContext(TimezoneContext);
    const [currentDate, setCurrentDate] = useState(toZonedTime(new Date(), timezone));
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportDate, setExportDate] = useState(new Date());
    const calendarRef = useRef(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(toZonedTime(new Date(), timezone));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const generatePDF = (dateToExport) => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // --- Header ---
            doc.setFillColor(243, 244, 246); // gray-100
            doc.rect(0, 0, pageWidth, 25, 'F');

            doc.setFontSize(22);
            doc.setTextColor(17, 24, 39);
            doc.text(format(dateToExport, 'MMMM yyyy'), 14, 16);

            doc.setFontSize(10);
            doc.setTextColor(107, 114, 128);
            doc.text(`Generated on ${format(new Date(), 'PPP')}`, pageWidth - 14, 16, { align: 'right' });

            // --- Calendar Grid Settings ---
            const margin = 14;
            const gridTop = 35;
            const gridBottom = pageHeight - margin;
            const gridHeight = gridBottom - gridTop;
            const gridWidth = pageWidth - (margin * 2);
            const cellWidth = gridWidth / 7;
            const cellHeight = gridHeight / 6; // 6 rows max

            // --- Draw Days Header ---
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'bold');

            days.forEach((day, i) => {
                const x = margin + (i * cellWidth);
                doc.text(day.toUpperCase(), x + (cellWidth / 2), gridTop - 3, { align: 'center' });
            });

            // --- Draw Grid & Dates ---
            // Use native Date instead of startOfMonth to avoid import issues
            const startDate = new Date(dateToExport.getFullYear(), dateToExport.getMonth(), 1);
            const startDayOfWeek = getDay(startDate);
            // Start from the Sunday before the 1st
            let current = addDays(startDate, -startDayOfWeek);

            doc.setDrawColor(229, 231, 235); // gray-200
            doc.setLineWidth(0.1);
            doc.setFont('helvetica', 'normal');

            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 7; col++) {
                    const x = margin + (col * cellWidth);
                    const y = gridTop + (row * cellHeight);

                    // Draw Cell
                    doc.rect(x, y, cellWidth, cellHeight);

                    // Date Number
                    const isCurrentMonth = current.getMonth() === dateToExport.getMonth();
                    doc.setTextColor(isCurrentMonth ? 0 : 180);
                    doc.setFontSize(10);
                    doc.text(format(current, 'd'), x + 2, y + 5);

                    // Events for this day
                    const dayEvents = events.filter(e => isSameDay(new Date(e.date), current));

                    let eventY = y + 10;
                    dayEvents.slice(0, 4).forEach(ev => {
                        // Priority Color Indicator
                        let r = 0, g = 0, b = 0;
                        if (ev.priority === 'High') { r = 239; g = 68; b = 68; } // Red
                        else if (ev.priority === 'Medium') { r = 249; g = 115; b = 22; } // Orange
                        else { r = 59; g = 130; b = 246; } // Blue

                        doc.setFillColor(r, g, b);
                        doc.rect(x + 1, eventY - 2.5, 2, 2, 'F');

                        doc.setFontSize(7);
                        doc.setTextColor(50);
                        // Truncate text
                        const title = ev.title.length > 15 ? ev.title.substring(0, 15) + '...' : ev.title;
                        doc.text(title, x + 4, eventY);

                        eventY += 4;
                    });

                    if (dayEvents.length > 4) {
                        doc.setFontSize(6);
                        doc.setTextColor(100);
                        doc.text(`+ ${dayEvents.length - 4} more`, x + 4, eventY);
                    }

                    current = addDays(current, 1);
                }
            }

            // --- Detailed List Page ---
            doc.addPage();

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text('Event Details', 14, 20);

            const tableData = events
                .filter(e => new Date(e.date).getMonth() === dateToExport.getMonth())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(event => [
                    format(new Date(event.date), 'MMM dd'),
                    event.time || '-',
                    event.title,
                    event.category,
                    event.priority,
                    event.description || '-'
                ]);

            autoTable(doc, {
                head: [['Date', 'Time', 'Title', 'Category', 'Priority', 'Description']],
                body: tableData,
                startY: 30,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 40, fontStyle: 'bold' },
                    5: { cellWidth: 'auto' }
                }
            });

            doc.save(`Schedule_${format(dateToExport, 'yyyy_MM')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            console.error("Error stack:", error.stack);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsExportModalOpen(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-background relative">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Calendar</h1>
                    <p className="text-slate-500 mt-1">Manage your schedule effectively.</p>
                </div>
                <button
                    onClick={() => {
                        setExportDate(currentDate);
                        setIsExportModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
                >
                    <FiDownload size={18} />
                    Export PDF
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6" ref={calendarRef}>
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{format(currentDate, 'MMMM')}</h2>
                        <p className="text-slate-500 font-medium">{format(currentDate, 'yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                            <FiChevronLeft size={20} />
                        </button>
                        <button onClick={goToToday} className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 mb-2">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 py-2 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr border-t border-l border-slate-100">
                    {calendarDays.map((day, dayIdx) => {
                        const dayEvents = events.filter((event) => {
                            const eventDate = toZonedTime(new Date(event.date), timezone);
                            return isSameDay(eventDate, day);
                        });
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, toZonedTime(new Date(), timezone));

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[120px] p-2 border-b border-r border-slate-100 relative ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span
                                        className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday
                                            ? 'bg-primary text-white'
                                            : isCurrentMonth
                                                ? 'text-slate-700'
                                                : 'text-slate-400'
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="space-y-1 overflow-y-auto max-h-[90px] custom-scrollbar">
                                    {dayEvents.map((event) => (
                                        <motion.div
                                            key={event._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`text-[10px] px-2 py-1 rounded-md truncate font-medium border-l-2 ${event.completed ? 'bg-slate-100 text-slate-400 border-slate-300 line-through' :
                                                event.priority === 'High' ? 'bg-red-50 text-red-700 border-red-500' :
                                                    event.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-500' :
                                                        'bg-blue-50 text-blue-700 border-blue-500'
                                                }`}
                                            title={event.title}
                                        >
                                            {event.time && <span className="mr-1 opacity-75">{event.time}</span>}
                                            {event.title}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Export Schedule</h3>
                        <p className="text-slate-500 mb-6">Select the month you want to export.</p>

                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl mb-6">
                            <button
                                onClick={() => setExportDate(subMonths(exportDate, 1))}
                                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-sm"
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <span className="text-lg font-semibold text-slate-800">
                                {format(exportDate, 'MMMM yyyy')}
                            </span>
                            <button
                                onClick={() => setExportDate(addMonths(exportDate, 1))}
                                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-sm"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsExportModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => generatePDF(exportDate)}
                                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <FiDownload size={18} />
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Calendar;
