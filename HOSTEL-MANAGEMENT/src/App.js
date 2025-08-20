import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Notification from './components/Notification';
import { FaUserCircle, FaBed, FaUserFriends, FaUserShield } from 'react-icons/fa';

// Dummy authentication and data for demonstration
const dummyUser = { username: 'student', isAdmin: false };
const dummyAdmin = { username: 'admin', isAdmin: true };

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [notif, setNotif] = useState({ show: false, message: '' });
  const [user, setUser] = useState(null); // null = not logged in
  const [bookedRooms, setBookedRooms] = useState([
    { room: 'A101', occupant: 'John Doe' },
    { room: 'B202', occupant: 'Jane Smith' }
  ]);
  const [requestedRooms, setRequestedRooms] = useState([
    { room: 'C303', requester: 'Alice' }
  ]);
  const [roommateRequest, setRoommateRequest] = useState(null);

  React.useEffect(() => {
    setNotif({ show: true, message: 'Welcome to Hostel Management!' });
    setTimeout(() => setNotif({ show: false, message: '' }), 3000);
  }, []);

  // Simulate login
  const handleLogin = (asAdmin = false) => {
    setUser(asAdmin ? dummyAdmin : dummyUser);
    setNotif({ show: true, message: asAdmin ? 'Logged in as Admin' : 'Logged in as Student' });
    setTimeout(() => setNotif({ show: false, message: '' }), 2000);
  };

  // Easy booking handler
  const handleEasyBooking = () => {
    if (!user) {
      setNotif({ show: true, message: 'Please login to book a room.' });
      return;
    }
    setNotif({ show: true, message: 'Room booked successfully!' });
    setBookedRooms([...bookedRooms, { room: 'D404', occupant: user.username }]);
    setTimeout(() => setNotif({ show: false, message: '' }), 2000);
  };

  // Roommate request handler
  const handleRoommateRequest = () => {
    if (!user) {
      setNotif({ show: true, message: 'Please login to request a roommate.' });
      return;
    }
    setRoommateRequest({ status: 'Requested', by: user.username });
    setNotif({ show: true, message: 'Roommate request sent!' });
    setTimeout(() => setNotif({ show: false, message: '' }), 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-400 opacity-90" />
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 opacity-30 rounded-full filter blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 opacity-30 rounded-full filter blur-3xl -z-10 animate-pulse delay-1000" />
      {/* Main Content */}
      <header className="flex justify-between items-center p-8 w-full max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-3">
          <FaBed className="text-4xl text-white drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold tracking-wide text-white drop-shadow-lg font-mono">Hostel Management</h1>
        </div>
        <div className="flex gap-2">
          {!user && (
            <>
              <button
                onClick={() => handleLogin(false)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow-lg hover:scale-105 hover:from-green-500 hover:to-green-700 transition"
              >
                Login as Student
              </button>
              <button
                onClick={() => handleLogin(true)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold shadow-lg hover:scale-105 hover:from-yellow-500 hover:to-yellow-700 transition"
              >
                Login as Admin
              </button>
            </>
          )}
          {user && (
            <button
              onClick={() => setUser(null)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold shadow-lg hover:scale-105 hover:from-red-500 hover:to-red-700 transition"
            >
              Logout
            </button>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>
      <AnimatePresence>
        <Notification message={notif.message} show={notif.show} />
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center w-full z-10"
        >
          <div className="w-full max-w-4xl mx-auto bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 mt-10 border border-white/30">
            <Dashboard />
            {/* Easy Booking Section */}
            <div className="my-10">
              <div className="flex items-center gap-3 mb-4">
                <FaBed className="text-2xl text-indigo-600" />
                <h2 className="text-2xl font-extrabold text-indigo-700 tracking-tight">Easy Booking</h2>
              </div>
              <button
                onClick={handleEasyBooking}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold shadow-xl hover:scale-105 hover:from-indigo-600 hover:to-pink-600 transition text-lg"
              >
                Book a Room
              </button>
            </div>
            {/* Roommate Request Section */}
            <div className="my-10">
              <div className="flex items-center gap-3 mb-4">
                <FaUserFriends className="text-2xl text-pink-600" />
                <h2 className="text-2xl font-extrabold text-pink-700 tracking-tight">Roommate Request</h2>
              </div>
              <button
                onClick={handleRoommateRequest}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold shadow-xl hover:scale-105 hover:from-pink-600 hover:to-indigo-600 transition text-lg"
              >
                Request Roommate
              </button>
              {user && roommateRequest && (
                <div className="mt-6 flex items-center gap-2 p-4 rounded-xl bg-green-100/80 text-green-900 font-semibold shadow-inner">
                  <FaUserCircle className="text-2xl" />
                  Roommate request status: {roommateRequest.status} by {roommateRequest.by}
                </div>
              )}
            </div>
            {/* Admin Control Panel */}
            {user && user.isAdmin && (
              <div className="my-10">
                <div className="flex items-center gap-3 mb-4">
                  <FaUserShield className="text-2xl text-yellow-600" />
                  <h2 className="text-2xl font-extrabold text-yellow-700 tracking-tight">Admin Control Panel</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-green-200/70 rounded-2xl p-6 shadow-lg border border-green-300/40">
                    <h3 className="font-bold text-lg mb-3 text-green-900 flex items-center gap-2">
                      <FaBed className="text-green-700" /> Booked Rooms
                    </h3>
                    <ul>
                      {bookedRooms.map((room, idx) => (
                        <li key={idx} className="mb-2 flex items-center gap-2">
                          <FaUserCircle className="text-green-700" />
                          <span className="font-semibold">{room.room}</span> - {room.occupant}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-pink-200/70 rounded-2xl p-6 shadow-lg border border-pink-300/40">
                    <h3 className="font-bold text-lg mb-3 text-pink-900 flex items-center gap-2">
                      <FaUserFriends className="text-pink-700" /> Requested Rooms
                    </h3>
                    <ul>
                      {requestedRooms.map((req, idx) => (
                        <li key={idx} className="mb-2 flex items-center gap-2">
                          <FaUserCircle className="text-pink-700" />
                          <span className="font-semibold">{req.room}</span> - Requested by {req.requester}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.main>
      </AnimatePresence>
      {/* Optional: Add a subtle footer */}
      <footer className="w-full text-center py-4 text-white/80 font-mono text-sm z-10">
        &copy; {new Date().getFullYear()} Hostel Management. All rights reserved.
      </footer>
      {/* Custom animation for gradient */}
      <style>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 8s ease-in-out infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default App;