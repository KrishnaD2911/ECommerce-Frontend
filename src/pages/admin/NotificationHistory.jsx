import { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineBell, HiOutlineSearch, HiChevronLeft, HiChevronRight, HiArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const NotificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const resPerPage = 20;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`/api/v1/notifications/history?page=${currentPage}&limit=${resPerPage}`, config);
      setHistory(res.data.data || []);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link to="/admin/notifications" className="inline-flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors mb-4 scale-95 hover:scale-100">
            <HiArrowLeft /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-2xl text-black shadow-lg shadow-orange-500/30">
              <HiOutlineBell />
            </div>
            Notification Ledger
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Complete history of all automated system notifications.</p>
        </div>
        <div className="bg-black border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Records</span>
          <span className="text-xl font-black text-white">{totalCount}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/5 bg-[#111]">
              <tr>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-xs">Date & Time</th>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-xs">Event / Rule</th>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-xs">Recipient</th>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-xs">Message</th>
                <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5" className="px-6 py-5">
                      <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-zinc-500">
                      <HiOutlineBell className="text-4xl mb-3 opacity-40" />
                      <p className="font-bold">No notifications found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map(notif => (
                  <tr key={notif._id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-xs font-medium text-zinc-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-fuchsia-500/10 text-fuchsia-400 uppercase tracking-wider border border-fuchsia-500/20">
                        {notif.type || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {notif.user ? (
                        <div>
                          <div className="font-bold text-white text-sm">{notif.user.name}</div>
                          <div className="text-xs text-zinc-500">{notif.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic text-xs">Admin / System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-bold text-white text-sm">{notif.title}</div>
                      <div className="text-xs text-zinc-400 truncate">{notif.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        notif.read ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {notif.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 bg-[#111] px-6 py-4">
            <div className="text-xs font-medium text-zinc-500">
              Showing <span className="font-bold text-white">{(currentPage - 1) * resPerPage + 1}</span> to{' '}
              <span className="font-bold text-white">{Math.min(currentPage * resPerPage, totalCount)}</span> of{' '}
              <span className="font-bold text-white">{totalCount}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronLeft /> Prev
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <HiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;
