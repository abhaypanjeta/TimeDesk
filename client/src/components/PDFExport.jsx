import { FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFExport = ({ targetRef, fileName = 'schedule.pdf' }) => {
    const handleExport = async () => {
        const element = targetRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(fileName);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
        >
            <FiDownload size={18} />
            Export PDF
        </button>
    );
};

export default PDFExport;
