import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import EventContext, { EventProvider } from './context/EventContext';
import { TimezoneProvider } from './context/TimezoneContext';
import TimezoneContext from './context/TimezoneContext';

import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import DailyTable from './pages/DailyTable';

import EventModal from './components/EventModal';

import { FiMenu } from 'react-icons/fi';
import { useState } from 'react';
import { fromZonedTime } from 'date-fns-tz';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const { isModalOpen, closeModal, createEvent, updateEvent, editingEvent } = useContext(EventContext);
  const { timezone } = useContext(TimezoneContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const handleSubmit = async (data) => {
    // Convert date string to timezone-aware date to prevent off-by-one errors
    // The date input gives us "YYYY-MM-DD", which needs to be treated as midnight in the user's timezone
    if (data.date) {
      // Parse the date string as midnight in the user's selected timezone
      const dateString = `${data.date}T00:00:00`;
      const zonedDate = fromZonedTime(dateString, timezone);
      data.date = zonedDate.toISOString();
    }

    if (editingEvent) {
      await updateEvent(editingEvent._id, data);
    } else {
      await createEvent(data);
    }
    closeModal();
  };

  return user ? (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 flex items-center px-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <FiMenu size={24} />
        </button>
        <span className="ml-3 font-bold text-slate-800 text-lg">TimeDesk</span>
      </div>

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 transition-all duration-300">
        <Outlet />
      </main>
      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingEvent}
      />
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <AuthProvider>
      <TimezoneProvider>
        <EventProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/table" element={<DailyTable />} />
                <Route path="/calendar" element={<Calendar />} />
              </Route>
            </Routes>
          </Router>
        </EventProvider>
      </TimezoneProvider>
    </AuthProvider>
  );
}

export default App;
