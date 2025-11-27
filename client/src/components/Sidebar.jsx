import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiCalendar, FiLogOut, FiPlus, FiList, FiGlobe } from 'react-icons/fi';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import EventContext from '../context/EventContext';
import TimezoneContext from '../context/TimezoneContext';
import clsx from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const { openModal } = useContext(EventContext);
    const { timezone, updateTimezone, timezones } = useContext(TimezoneContext);
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: FiGrid, path: '/' },
        { name: 'Table', icon: FiList, path: '/table' },
        { name: 'Calendar', icon: FiCalendar, path: '/calendar' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={clsx(
                    'fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 z-40 transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            <FiGrid />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">TimeDesk</h1>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => onClose && onClose()} // Close on navigation (mobile)
                                    className={clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    )}
                                >
                                    <Icon size={20} />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                        <button
                            onClick={() => {
                                openModal();
                                onClose && onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 mt-4"
                        >
                            <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                <FiPlus size={14} />
                            </div>
                            <span>Add Event</span>
                        </button>
                    </nav>
                </div>

                <div>
                    <div className="px-4 mb-6">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                            <FiGlobe size={14} />
                            <span className="font-medium">Timezone</span>
                        </div>
                        <select
                            value={timezone}
                            onChange={(e) => updateTimezone(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                            {timezones.map((tz) => (
                                <option key={tz} value={tz}>
                                    {tz.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 mb-6 px-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-500 transition-colors w-full text-left text-sm font-medium"
                    >
                        <FiLogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
