import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineBell, HiOutlineMail, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [rules, setRules] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const [rulesRes, subsRes] = await Promise.all([
        axios.get('/api/v1/notifications/rules', config),
        axios.get('/api/v1/restock', config)
      ]);
      setRules(rulesRes.data.data);
      setSubscriptions(subsRes.data.data);
    } catch (err) {
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRule = async (event, currentStatus) => {
    try {
      await axios.post('/api/v1/notifications/rules', {
        event,
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Rule updated successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to update rule');
    }
  };

  const getRuleStatus = (event) => {
    const rule = rules.find(r => r.event === event);
    return rule ? rule.isActive : true; // Default is true if rule not found yet
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="loader h-12 w-12 rounded-full border-4 border-slate-800 border-t-orange-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors mb-4 scale-95 hover:scale-100">
            <HiArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white">Notification Engine</h1>
          <p className="mt-2 text-sm text-zinc-400">Manage automated alerts and customer subscriptions.</p>
        </div>
        <Link to="/admin/notifications/history" className="btn btn-secondary bg-[#0a0a0a] border border-fuchsia-500/20 text-fuchsia-400 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10 shadow-sm px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all w-fit">
          <HiOutlineBell className="text-lg" /> View Ledger History
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Rules Section */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0a0a] shadow-xl">
            <div className="border-b border-slate-800 p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <HiOutlineBell className="text-orange-500" />
                Business Rules
              </h2>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Low Stock Alerts</h3>
                  <p className="text-xs text-zinc-500 mt-1">Notify admins when inventory falls below threshold.</p>
                </div>
                <button 
                  onClick={() => toggleRule('low_stock', getRuleStatus('low_stock'))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${getRuleStatus('low_stock') ? 'bg-orange-500' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${getRuleStatus('low_stock') ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Restock Emails</h3>
                  <p className="text-xs text-zinc-500 mt-1">Automatically notify customers when items are restocked.</p>
                </div>
                <button 
                  onClick={() => toggleRule('restock', getRuleStatus('restock'))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${getRuleStatus('restock') ? 'bg-orange-500' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${getRuleStatus('restock') ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0a0a] shadow-xl h-full">
            <div className="border-b border-slate-800 p-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <HiOutlineMail className="text-blue-500" />
                Restock Waitlist
              </h2>
              <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                {subscriptions.length} Total
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-[#111]">
                  <tr>
                    <th className="px-6 py-4 font-bold text-white">Product</th>
                    <th className="px-6 py-4 font-bold text-white">Customer Email</th>
                    <th className="px-6 py-4 font-bold text-white">Status</th>
                    <th className="px-6 py-4 font-bold text-white">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subscriptions.map(sub => (
                    <tr key={sub._id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{sub.product?.name || 'Unknown'}</div>
                        <div className="text-xs text-zinc-500">Stock: {sub.product?.stock || 0}</div>
                      </td>
                      <td className="px-6 py-4">{sub.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          sub.status === 'notified' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">
                        No active restock subscriptions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
