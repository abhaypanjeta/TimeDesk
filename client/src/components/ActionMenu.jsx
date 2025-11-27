import { useState, useEffect, useRef } from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ActionMenu = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <FiMoreVertical size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onEdit();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2"
                    >
                        <FiEdit2 size={14} />
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onDelete();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                        <FiTrash2 size={14} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;
