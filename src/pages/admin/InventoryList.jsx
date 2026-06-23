import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  HiOutlinePlus,
  HiOutlineCube,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineShoppingCart,
  HiOutlineExclamation,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
  HiX,
  HiArrowLeft,
  HiArrowUp,
  HiArrowDown,
  HiSelector,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

// ─── Analytics Stat Card ────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent = 'orange', alert }) => {
  const accents = {
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-500',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${accents[accent]} ${alert ? 'ring-2 ring-red-500/20' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-1 font-title text-3xl font-black text-white">{value}</p>
          {sub && <p className="mt-1 text-xs font-semibold text-zinc-500">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${accents[accent].split(' ').slice(-1)}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ─── Low Stock Alert Row ────────────────────────────────────────────────────
const LowStockItem = ({ product }) => (
  <Link to={`/admin/products?search=${product.sku}`} className="flex items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 transition-colors hover:bg-red-500/15 group cursor-pointer block">
    <div className="h-9 w-9 overflow-hidden rounded-lg bg-black flex-shrink-0 group-hover:border group-hover:border-red-500/50">
      {product.image?.url ? (
        <img src={product.image.url} alt={product.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-zinc-600">
          <HiOutlineCube size={16} />
        </div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-white group-hover:text-red-300 transition-colors">{product.name}</p>
      <p className="text-xs text-zinc-500">{product.sku}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-black text-red-400">{product.stock} left</p>
      <p className="text-[10px] text-zinc-500">Threshold: {product.lowStockThreshold}</p>
    </div>
  </Link>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const InventoryList = () => {
  // Data
  const [adjustments, setAdjustments] = useState([]);
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const resPerPage = 15;

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get('/api/v1/inventory/stats?days=30', authHeaders());
      setStats(res.data.stats);
      setLowStockProducts(res.data.lowStockProducts || []);
    } catch {
      // Stats are non-critical; silently fail
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch adjustments
  const fetchAdjustments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', resPerPage);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (typeFilter) params.append('type', typeFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (sortField) params.append('sort', sortField);
      if (sortOrder) params.append('order', sortOrder);

      const res = await axios.get(`/api/v1/inventory?${params.toString()}`, authHeaders());
      setAdjustments(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory history');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, typeFilter, dateFrom, dateTo, sortField, sortOrder]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, dateFrom, dateTo, sortField, sortOrder]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <HiSelector className="inline ml-1 text-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === 'asc' ? <HiArrowUp className="inline ml-1 text-orange-500" /> : <HiArrowDown className="inline ml-1 text-orange-500" />;
  };

  const getTypeConfig = (type) => {
    const types = {
      sale: { icon: <HiOutlineShoppingCart />, label: 'Sale', color: 'text-blue-400', bg: 'bg-blue-500/10' },
      return: { icon: <HiOutlineRefresh />, label: 'Return', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      manual: { icon: <HiOutlineCube />, label: 'Manual', color: 'text-purple-400', bg: 'bg-purple-500/10' },
      damaged: { icon: <HiOutlineExclamationCircle />, label: 'Damaged', color: 'text-red-400', bg: 'bg-red-500/10' },
    };
    return types[type] || { icon: <HiOutlineCube />, label: type, color: 'text-zinc-400', bg: 'bg-zinc-500/10' };
  };

  const hasActiveFilters = debouncedSearch || typeFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  // ── CSV Export ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (adjustments.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Notes', 'Adjusted By'];
    const rows = adjustments.map((adj) => [
      new Date(adj.createdAt).toLocaleString(),
      adj.product?.name || 'Unknown',
      adj.product?.sku || '-',
      adj.type,
      adj.quantity,
      adj.previousStock,
      adj.newStock,
      (adj.notes || '').replace(/,/g, ';'),
      adj.createdBy?.name || 'System',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Ledger exported successfully!');
  };

  // ── Pagination Controls ─────────────────────────────────────────────────
  const paginationRange = useMemo(() => {
    const range = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [currentPage, totalPages]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-transparent pt-8 pb-12 px-4 border-b border-white/5">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/admin"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-zinc-300 shadow-sm border border-white/10 transition-all hover:border-orange-500/30 hover:text-orange-500 hover:-translate-y-0.5"
          >
            <HiArrowLeft /> Back to Dashboard
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
                <HiOutlineDocumentText />
              </div>
              <div>
                <h1 className="font-title text-4xl font-black text-white tracking-tight">
                  Inventory Ledger
                </h1>
                <p className="mt-1 text-zinc-400 font-medium text-lg">
                  Track, search, and analyze all stock movements.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] px-5 py-3 text-sm font-bold text-zinc-300 transition-all hover:border-orange-500/30 hover:text-orange-500"
              >
                <HiOutlineDownload className="text-lg" /> Export CSV
              </button>
              <Link
                to="/admin/inventory/new"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/25"
              >
                <HiOutlinePlus className="text-lg" /> Add Adjustment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 -mt-6 relative z-10">
        {/* ─── Analytics Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-5">
          {statsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/5 bg-[#0a0a0a]" />
            ))
          ) : stats ? (
            <>
              <StatCard
                icon={<HiOutlineTrendingUp />}
                label="Net Change"
                value={stats.netChange > 0 ? `+${stats.netChange}` : stats.netChange}
                sub={`${stats.totalTransactions} transactions`}
                accent={stats.netChange >= 0 ? 'green' : 'red'}
              />
              <StatCard
                icon={<HiOutlineShoppingCart />}
                label="Items Sold"
                value={Math.abs(stats.sales?.quantity || 0)}
                sub={`${stats.sales?.count || 0} orders`}
                accent="blue"
              />
              <StatCard
                icon={<HiOutlineRefresh />}
                label="Returns"
                value={stats.returns?.quantity || 0}
                sub={`${stats.returns?.count || 0} returns`}
                accent="green"
              />
              <StatCard
                icon={<HiOutlineExclamation />}
                label="Damaged"
                value={Math.abs(stats.damaged?.quantity || 0)}
                sub={`${stats.damaged?.count || 0} incidents`}
                accent="red"
              />
              <StatCard
                icon={<HiOutlineCube />}
                label="Manual Adj."
                value={stats.manual?.quantity || 0}
                sub={`${stats.manual?.count || 0} adjustments`}
                accent="purple"
              />
            </>
          ) : null}
        </div>

        {/* ─── Low Stock Alert ─────────────────────────────────────────────── */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-[#0a0a0a] p-5">
            <div className="mb-4 flex items-center gap-2">
              <HiOutlineExclamation className="text-xl text-red-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400">
                Low Stock Alert — {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((p) => (
                <LowStockItem key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Filters Bar ─────────────────────────────────────────────────── */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-[#0a0a0a] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg" />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500/50 transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-black py-3 pl-9 pr-10 text-sm text-white outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="return">Return</option>
                <option value="manual">Manual</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/50 transition-colors"
                  title="From date"
                />
              </div>
              <span className="text-zinc-600 font-bold">→</span>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/50 transition-colors"
                  title="To date"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-zinc-400 transition-all hover:text-red-400 hover:border-red-500/30"
              >
                <HiX className="text-base" /> Clear
              </button>
            )}
          </div>

          {/* Active Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
              <span>Showing {totalCount} result{totalCount !== 1 ? 's' : ''}</span>
              {debouncedSearch && (
                <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-orange-500 font-bold">
                  search: "{debouncedSearch}"
                </span>
              )}
              {typeFilter && (
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-purple-400 font-bold capitalize">
                  type: {typeFilter}
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-blue-400 font-bold">
                  date: {dateFrom || '...'} → {dateTo || '...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ─── Table ───────────────────────────────────────────────────────── */}
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-xl shadow-black/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="border-b border-white/5 bg-[#111]">
                  <tr>
                    <th 
                      onClick={() => handleSort('createdAt')}
                      className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer group hover:text-white transition-colors"
                    >
                      Date & Time {getSortIcon('createdAt')}
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Product
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer group hover:text-white transition-colors"
                    >
                      Type {getSortIcon('type')}
                    </th>
                    <th 
                      onClick={() => handleSort('quantity')}
                      className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer group hover:text-white transition-colors"
                    >
                      Adjustment {getSortIcon('quantity')}
                    </th>
                    <th 
                      onClick={() => handleSort('newStock')}
                      className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer group hover:text-white transition-colors"
                    >
                      Stock Balance {getSortIcon('newStock')}
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Adjusted By
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="7" className="px-6 py-5">
                          <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
                        </td>
                      </tr>
                    ))
                  ) : adjustments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center text-zinc-500">
                          <HiOutlineDocumentText className="text-4xl mb-3 opacity-40" />
                          <p className="font-bold">No adjustments found</p>
                          <p className="text-xs mt-1">
                            {hasActiveFilters
                              ? 'Try adjusting your filters.'
                              : 'Start by adding your first inventory adjustment.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    adjustments.map((adj) => {
                      const typeConf = getTypeConfig(adj.type);
                      const isPositive = adj.quantity > 0;
                      return (
                        <tr
                          key={adj._id}
                          className="transition-colors hover:bg-white/[0.02]"
                        >
                          {/* Date */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-white">
                              {new Date(adj.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {new Date(adj.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Product */}
                          <td className="px-6 py-4">
                            {adj.product ? (
                              <Link to={`/admin/products?search=${adj.product.sku}`} className="flex items-center gap-3 group block w-fit">
                                <div className="h-10 w-10 overflow-hidden rounded-xl bg-black border border-white/5 flex-shrink-0 group-hover:border-orange-500/50 transition-colors">
                                  {adj.product.image?.url ? (
                                    <img
                                      src={adj.product.image.url}
                                      alt={adj.product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                                      <HiOutlineCube size={18} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-bold text-white max-w-[180px] group-hover:text-orange-500 transition-colors">
                                    {adj.product.name}
                                  </div>
                                  <div className="text-xs font-mono text-zinc-500">
                                    {adj.product.sku}
                                  </div>
                                </div>
                              </Link>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-xl bg-black border border-white/5 flex-shrink-0">
                                  <div className="flex h-full w-full items-center justify-center text-zinc-600">
                                    <HiOutlineCube size={18} />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-bold text-zinc-500 max-w-[180px]">
                                    Deleted Product
                                  </div>
                                  <div className="text-xs font-mono text-zinc-600">
                                    -
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${typeConf.bg} ${typeConf.color}`}
                            >
                              {typeConf.icon}
                              {typeConf.label}
                            </span>
                          </td>

                          {/* Quantity */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-black ${
                                isPositive
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {isPositive ? (
                                <HiOutlineTrendingUp className="text-base" />
                              ) : (
                                <HiOutlineTrendingDown className="text-base" />
                              )}
                              {isPositive ? '+' : ''}
                              {adj.quantity}
                            </span>
                          </td>

                          {/* Stock Balance */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-zinc-500">{adj.previousStock}</span>
                              <span className="text-zinc-600">→</span>
                              <span className="font-black text-white">{adj.newStock}</span>
                            </div>
                          </td>

                          {/* Adjusted By */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-zinc-300">
                              {adj.createdBy?.name || 'System'}
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="px-6 py-4">
                            <p className="max-w-[200px] truncate text-xs text-zinc-500" title={adj.notes}>
                              {adj.notes || '—'}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ─── Pagination ────────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                <p className="text-xs text-zinc-500">
                  Page <span className="font-bold text-white">{currentPage}</span> of{' '}
                  <span className="font-bold text-white">{totalPages}</span>
                  <span className="ml-2">({totalCount} total entries)</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <HiChevronLeft />
                  </button>

                  {paginationRange.map((item, i) =>
                    item === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-zinc-600">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                          currentPage === item
                            ? 'bg-orange-500 text-black'
                            : 'border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <HiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
