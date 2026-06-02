import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductStats, fetchProducts } from '../../redux/productSlice';
import { fetchAllOrders, updateOrderStatus } from '../../redux/orderSlice';
import { Link } from 'react-router-dom';
import {
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineExclamationCircle,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiArrowRight,
  HiPlus,
  HiOutlineSparkles,
  HiOutlineViewGrid,
  HiGlobe
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProductStats());
    dispatch(fetchAllOrders());

    dispatch(fetchProducts())
      .unwrap()
      .then(res => {
        setRecentProducts(res.products.slice(0, 5));
      })
      .catch(() => toast.error('Failed to load recent products'));
  }, [dispatch]);

  if (loading && !stats) {
    return <div className="flex h-64 items-center justify-center"><div className="loader" /></div>;
  }

  if (error) {
    return <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center font-semibold text-red-400">Error loading dashboard: {error}</div>;
  }

  const totals = stats?.totals || {
    totalProducts: 0,
    totalActive: 0,
    totalInactive: 0,
    outOfStock: 0,
    totalStock: 0,
    totalInventoryValue: 0,
    avgPrice: 0,
  };

  const categoryStats = stats?.categoryStats || [];
  const pendingRequests = orders ? orders.filter(o => o.status === 'return_requested' || o.status === 'exchange_requested') : [];

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('en-IN').format(val || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleApproveRequest = (id, type) => {
    const newStatus = type === 'return_requested' ? 'returned' : 'exchanged';
    dispatch(updateOrderStatus({ id, status: newStatus }))
      .unwrap()
      .then(() => toast.success(`Request approved successfully`))
      .catch((err) => toast.error(err || 'Failed to approve request'));
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Black Header */}
      <div className="bg-black pt-8 pb-12 px-4 border-b border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
                <HiOutlineViewGrid />
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-0.5 text-xs font-black text-orange-500 uppercase tracking-wide">
                  <HiGlobe />
                  Admin Portal
                </div>
                <h1 className="font-title text-4xl md:text-5xl font-black text-white tracking-tight">Overview</h1>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <Link to="/admin/products" className="btn btn-secondary bg-[#0a0a0a] border border-black/10 text-zinc-300 hover:border-orange-500/30 hover:text-orange-500 shadow-sm px-4 md:px-6">
                Inventory
              </Link>
              <Link to="/admin/gift-cards" className="btn btn-secondary bg-[#0a0a0a] border border-black/10 text-zinc-300 hover:border-orange-500/30 hover:text-orange-500 shadow-sm px-4 md:px-6">
                Gift Cards
              </Link>
              <Link to="/admin/products/new" className="btn btn-primary bg-orange-500 text-black hover:bg-orange-600 px-4 md:px-6 flex items-center gap-2">
                <HiPlus className="text-lg" /> Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 -mt-6 relative z-10">
        
        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-1 flex gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">  
          <Link to="/admin/products"><StatCard icon={<HiOutlineCube />} title="Total Products" value={formatNumber(totals.totalProducts)} accent="orange" /></Link>
          <Link to="/admin/products"><StatCard icon={<HiOutlineCheckCircle />} title="Active" value={formatNumber(totals.totalActive)} accent="emerald" /></Link>
          <Link to="/admin/products"><StatCard icon={<HiOutlineXCircle />} title="Inactive" value={formatNumber(totals.totalInactive)} accent="zinc" /></Link>
          <Link to="/admin/products"><StatCard icon={<HiOutlineExclamationCircle />} title="Out of Stock" value={formatNumber(totals.outOfStock)} accent="red" alert={totals.outOfStock > 0} /></Link>
          <Link to="/admin/products"><StatCard icon={<HiOutlineChartBar />} title="Avg. Price" value={formatCurrency(totals.avgPrice)} accent="orange" /></Link>
          <Link to="/admin/products"><StatCard icon={<HiOutlineCurrencyRupee />} title="Inventory Value" value={formatCurrency(totals.totalInventoryValue)} accent="blue" /></Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Category Distribution */}
          <section className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-6 md:p-8 lg:col-span-2">
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="font-title text-2xl font-black text-white">Category Mix</h2>
              <span className="rounded-full bg-white/10 text-zinc-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">{categoryStats.length} Categories</span>
            </div>

            {categoryStats.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-medium">No category data available.</div>
            ) : (
              <div className="space-y-6">
                {categoryStats.map((cat, index) => {
                  const percentage = totals.totalProducts ? (cat.count / totals.totalProducts) * 100 : 0;
                  return (
                    <div key={cat._id || index} className="group">
                      <div className="mb-2 flex justify-between gap-4 text-sm">
                        <span className="font-bold text-zinc-300">{cat._id}</span>
                        <span className="font-bold text-zinc-500">{cat.count} items <span className="text-orange-500">({percentage.toFixed(1)}%)</span></span>
                      </div>
                      <div className="h-3.5 overflow-hidden rounded-full bg-black/50 shadow-inner">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000 ease-out group-hover:from-orange-400 group-hover:to-amber-400" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Products */}
          <section className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="font-title text-2xl font-black text-white">Recent Additions</h2>
              <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors">
                View All <HiArrowRight />
              </Link>
            </div>

            <div className="space-y-4">
              {recentProducts.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-medium">No recent products.</div>
              ) : (
                recentProducts.map(product => (
                  <div key={product._id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black p-3 transition-colors hover:border-orange-500/20 hover:bg-orange-500/5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-orange-500/15 text-orange-500 font-black text-lg">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-white">{product.name}</h4>
                      <p className="text-xs font-semibold text-zinc-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">{formatCurrency(product.price)}</div>
                      <div className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        product.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                        product.status === 'out_of_stock' ? 'bg-red-500/15 text-red-400' :
                        'bg-zinc-500/15 text-zinc-300'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Pending Requests Section */}
        <div className="mt-6">
          <section className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500 text-xl">
                  <HiOutlineExclamationCircle />
                </div>
                <h2 className="font-title text-2xl font-black text-white">Pending Requests</h2>
              </div>
              <span className="rounded-full bg-white/10 text-zinc-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {pendingRequests.length} action{pendingRequests.length !== 1 ? 's' : ''} needed
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-medium flex flex-col items-center">
                <HiOutlineCheckCircle className="text-5xl text-emerald-500/50 mb-3" />
                All caught up! No pending returns or exchanges.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="border-b border-white/5 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Order ID</th>
                      <th className="px-4 py-3 font-bold">Customer</th>
                      <th className="px-4 py-3 font-bold">Request Type</th>
                      <th className="px-4 py-3 font-bold">Date</th>
                      <th className="px-4 py-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map(req => (
                      <tr key={req._id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                        <td className="px-4 py-4 font-mono font-bold text-white">#{req._id.substring(req._id.length - 8).toUpperCase()}</td>
                        <td className="px-4 py-4 font-medium text-white">{req.user?.name || 'Unknown User'}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold uppercase text-orange-500">
                            {req.status === 'return_requested' ? 'Return' : 'Exchange'}
                          </span>
                        </td>
                        <td className="px-4 py-4">{formatDate(req.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => handleApproveRequest(req._id, req.status)}
                            className="btn bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-black border border-orange-500/20 px-4 py-1.5 text-xs"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const accentClasses = {
  orange: 'bg-orange-500/15 text-orange-500',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  zinc: 'bg-zinc-500/15 text-zinc-400',
  red: 'bg-red-500/15 text-red-400',
  blue: 'bg-blue-500/15 text-blue-400',
};

const StatCard = ({ icon, title, value, accent, alert }) => (
  <div className={`bg-[#0a0a0a] rounded-[24px] border ${alert ? 'border-red-500/30 ring-2 ring-red-500/10' : 'border-white/5'} shadow-sm p-6 transition-all hover:-translate-y-1 hover:shadow-md`}>
    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${accentClasses[accent]}`}>
      {icon}
    </div>
    <h3 className="text-sm font-bold text-zinc-500 mb-1">{title}</h3>
    <div className="font-title text-3xl font-black text-white truncate" title={value}>{value}</div>
  </div>
);

export default Dashboard;
