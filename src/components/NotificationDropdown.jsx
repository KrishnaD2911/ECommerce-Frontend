import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { HiOutlineBell, HiCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/v1/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:text-white transition-colors"
      >
        <HiOutlineBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-black shadow-sm shadow-orange-500/50 border border-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-[#0a0a0a] shadow-2xl overflow-hidden z-50">
          <div className="border-b border-slate-800 bg-[#111] px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <HiOutlineBell className="mx-auto text-3xl mb-2 opacity-50" />
                <p>You have no new notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map(notif => (
                  <div key={notif._id} className="p-4 hover:bg-slate-800/30 transition-colors flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {notif.type === 'low_stock' ? (
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          ⚠️
                        </div>
                      ) : notif.type === 'out_of_stock' ? (
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                          🚨
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300">{notif.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-800 text-zinc-400 hover:text-white hover:bg-orange-500 flex items-center justify-center transition-colors"
                      title="Mark as read"
                    >
                      <HiCheck size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {user?.role === 'admin' && (
            <div className="border-t border-slate-800 bg-[#111] p-2">
              <Link 
                to="/admin/notifications/history" 
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-sm font-bold text-orange-500 hover:bg-orange-500/10 rounded-xl transition-colors"
              >
                View All Notification History
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
