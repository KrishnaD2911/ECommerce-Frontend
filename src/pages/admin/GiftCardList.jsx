import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchGiftCards,
  fetchGiftCardStats,
  deleteGiftCard,
  bulkStatusUpdate,
  setGiftCardPage,
  setGiftCardFilters,
  clearGiftCardFilters,
  setActiveTab,
} from '../../redux/giftCardSlice';
import {
  HiPlus,
  HiOutlineCollection,
  HiOutlineViewGrid,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiArrowUp,
  HiArrowDown,
  HiOutlineDownload,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineGift,
  HiChevronDown,
  HiChevronUp,
  HiSelector,
} from 'react-icons/hi';
import Pagination from '@mui/material/Pagination';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const GiftCardList = () => {
  const dispatch = useDispatch();
  const { giftCards, loading, error, page, pages, filters, totalGiftCards, activeTab, stats, statsLoading } = useSelector((state) => state.giftCards);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    dispatch(fetchGiftCardStats());
  }, [dispatch]);

  useEffect(() => {
    const sortParam = filters.sort ? `&sort=${filters.sort}` : '';
    const tabParam = activeTab === 'admin' ? '&isPurchased=false' : activeTab === 'purchased' ? '&isPurchased=true' : '';
    dispatch(fetchGiftCards(`?page=${page}&search=${filters.search}&status=${filters.status}${sortParam}${tabParam}`));
  }, [dispatch, page, filters, activeTab]);

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? giftCards.map(g => g._id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter(itemId => itemId !== id) : [...current, id]
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this gift card?')) {
      dispatch(deleteGiftCard(id)).then(() => {
        toast.success('Gift card deleted');
        setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        dispatch(fetchGiftCardStats());
      });
    }
  };

  const handleBulkStatusUpdate = (status) => {
    if (selectedIds.length === 0) return toast.error('No gift cards selected');
    if (window.confirm(`Mark ${selectedIds.length} gift cards as ${status}?`)) {
      dispatch(bulkStatusUpdate({ ids: selectedIds, status })).then(() => {
        toast.success(`Updated ${selectedIds.length} gift cards`);
        setSelectedIds([]);
        dispatch(fetchGiftCardStats());
      });
    }
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setGiftCardPage(newPage));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setGiftCardFilters({ search: searchInput }));
  };

  const handleStatusChange = (e) => {
    dispatch(setGiftCardFilters({ status: e.target.value }));
  };

  const handleSort = (field) => {
    let newSort = field;
    if (filters.sort === field) {
      newSort = `-${field}`;
    } else if (filters.sort === `-${field}`) {
      newSort = '';
    }
    dispatch(setGiftCardFilters({ sort: newSort }));
  };

  const toggleExpand = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const getSortIcon = (field) => {
    if (filters.sort === field) return <HiArrowUp className="inline ml-1 text-orange-500" />;
    if (filters.sort === `-${field}`) return <HiArrowDown className="inline ml-1 text-orange-500" />;
    return <HiSelector className="inline ml-1 text-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />;
  };

  const handleExportCSV = () => {
    const user = authService.getCurrentUser();
    const token = user?.token;
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    fetch('/api/v1/giftcards/export', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gift-cards-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!');
      })
      .catch(() => toast.error('Failed to export CSV'));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const tabItems = [
    { key: 'all', label: 'All Cards', count: stats?.totalCards },
    { key: 'admin', label: 'Admin Created', count: stats?.totalAdminCreatedCards, icon: <HiOutlineShieldCheck /> },
    { key: 'purchased', label: 'Customer Bought', count: stats?.totalPurchasedCards, icon: <HiOutlineShoppingBag /> },
  ];

  return (
    <div className="min-h-screen bg-black pb-20">
      
      {/* Black Header */}
      <div className="bg-black pt-8 pb-10 px-4 border-b border-white/5 mb-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
              <HiOutlineCollection />
            </div>
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-0.5 text-xs font-black text-orange-500 uppercase tracking-wide">
                <HiOutlineViewGrid />
                Management
              </div>
              <h1 className="font-title text-3xl font-black text-white sm:text-4xl">Gift Cards</h1>
              <p className="mt-2 text-sm font-medium text-zinc-400">
                Manage digital gift cards, track usage, and view balances.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="group flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm font-bold text-zinc-300 hover:text-white hover:border-white/20 transition-all active:scale-95"
            >
              <HiOutlineDownload className="text-lg" />
              Export CSV
            </button>
            <Link
              to="/admin/gift-cards/new"
              className="group flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 hover:shadow-orange-500/40 active:scale-95"
            >
              <HiPlus className="text-lg transition-transform group-hover:rotate-90" />
              Create Gift Card
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">

        {/* Analytics Dashboard */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <HiOutlineCheckCircle className="text-xl" />
              </div>
              <span className="text-sm font-bold text-zinc-400">Active Cards</span>
            </div>
            <p className="font-title text-3xl font-black text-white">
              {statsLoading ? '...' : stats?.totalActiveCards ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <HiOutlineCurrencyRupee className="text-xl" />
              </div>
              <span className="text-sm font-bold text-zinc-400">Total Liability</span>
            </div>
            <p className="font-title text-3xl font-black text-orange-500">
              {statsLoading ? '...' : formatCurrency(stats?.totalLiability)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Unused balance across active cards</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <HiOutlineGift className="text-xl" />
              </div>
              <span className="text-sm font-bold text-zinc-400">Redeemed</span>
            </div>
            <p className="font-title text-3xl font-black text-white">
              {statsLoading ? '...' : stats?.totalRedeemedCards ?? 0}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {statsLoading ? '...' : formatCurrency(stats?.totalRedeemedValue)} used
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <HiOutlineShoppingBag className="text-xl" />
              </div>
              <span className="text-sm font-bold text-zinc-400">Customer Bought</span>
            </div>
            <p className="font-title text-3xl font-black text-white">
              {statsLoading ? '...' : stats?.totalPurchasedCards ?? 0}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Total issued: {statsLoading ? '...' : formatCurrency(stats?.totalIssuedValue)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-xl bg-[#0a0a0a] border border-white/5 p-1.5 w-fit">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => dispatch(setActiveTab(tab.key))}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Filters & Search */}
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
            <input
              type="text"
              placeholder="Search by code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#0f0a15] py-2.5 px-4 text-white outline-none focus:bg-[#1a1225]"
            />
            <button type="submit" className="bg-zinc-800 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-zinc-700">Search</button>
          </form>
          
          <select 
            value={filters.status} 
            onChange={handleStatusChange}
            className="rounded-xl border border-slate-700 bg-[#0f0a15] py-2.5 px-4 text-white outline-none focus:bg-[#1a1225]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="redeemed">Redeemed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Bulk Toolbar */}
        {selectedIds.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[#0f0a15] border border-orange-500/30 flex items-center justify-between">
            <span className="text-sm font-bold text-orange-500">{selectedIds.length} cards selected</span>
            <div className="flex gap-2">
              <button onClick={() => handleBulkStatusUpdate('active')} className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-700">Set Active</button>
              <button onClick={() => handleBulkStatusUpdate('inactive')} className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-700">Set Inactive</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f0a15] shadow-xl">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-[#1a1225] text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
                    checked={giftCards.length > 0 && selectedIds.length === giftCards.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-4 py-4 font-bold">Type</th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('createdAt')}
                  title="Sort by Newest / Oldest"
                >
                  Created {getSortIcon('createdAt')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  Initial Amount {getSortIcon('amount')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('balance')}
                >
                  Balance {getSortIcon('balance')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('activationDate')}
                  title="Sort by Activation Date"
                >
                  Activation {getSortIcon('activationDate')}
                </th>
                <th 
                  className="px-6 py-4 font-bold cursor-pointer group hover:text-white transition-colors"
                  onClick={() => handleSort('expiryDate')}
                  title="Sort by Expiry Date"
                >
                  Expiry {getSortIcon('expiryDate')}
                </th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-zinc-500">Loading gift cards...</td>
                </tr>
              ) : giftCards.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-zinc-500">No gift cards found.</td>
                </tr>
              ) : (
                giftCards.map((card) => (
                  <tr key={card._id} className="border-t border-white/5 hover:bg-[#1a1225]/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
                        checked={selectedIds.includes(card._id)}
                        onChange={() => handleSelectOne(card._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">{card.code}</span>
                        {(card.createdBy || card.recipientName) && (
                          <button 
                            onClick={() => toggleExpand(card._id)}
                            className="p-1 rounded-md bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {expandedCardId === card._id ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                      
                      {expandedCardId === card._id ? (
                        <div className="mt-2 rounded-lg bg-black/40 border border-white/5 p-2.5 text-xs space-y-1.5 min-w-[200px]">
                          {card.isPurchased && card.recipientName && (
                            <div>
                              <span className="text-zinc-500 font-bold block mb-0.5">Recipient:</span>
                              <p className="text-zinc-300">{card.recipientName}</p>
                              {card.recipientEmail && <p className="text-zinc-400">{card.recipientEmail}</p>}
                            </div>
                          )}
                          {card.createdBy && (
                            <div className={card.isPurchased && card.recipientName ? "pt-1.5 mt-1.5 border-t border-white/5" : ""}>
                              <span className="text-zinc-500 font-bold block mb-0.5">{card.isPurchased ? "Purchased By:" : "Created By:"}</span>
                              <p className="text-zinc-300">{card.createdBy.name}</p>
                              <p className="text-zinc-400">{card.createdBy.email}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {card.isPurchased && card.recipientName && (
                            <p className="text-xs text-zinc-500 mt-1">To: {card.recipientName}</p>
                          )}
                          {card.createdBy?.email && (
                            <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[150px]" title={card.createdBy.email}>
                              By: {card.createdBy.name?.split(' ')[0]}
                            </p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        card.isPurchased
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {card.isPurchased ? (
                          <><HiOutlineShoppingBag className="text-xs" /> Bought</>
                        ) : (
                          <><HiOutlineShieldCheck className="text-xs" /> Admin</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-400">
                      {new Date(card.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-300">₹{card.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${card.balance === 0 ? 'text-red-400' : 'text-green-400'}`}>
                        ₹{card.balance}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-400">
                      {card.activationDate ? new Date(card.activationDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : <span className="text-zinc-600">Now</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-400">
                      {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : <span className="text-zinc-600">Never</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        card.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        card.status === 'inactive' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        card.status === 'redeemed' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/gift-cards/edit/${card._id}`}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          <HiOutlinePencilAlt className="text-xl" />
                        </Link>
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <HiOutlineTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center pb-8">
            <Pagination 
              count={pages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              sx={{
                '& .MuiPaginationItem-root': { color: '#a1a1aa' },
                '& .Mui-selected': { backgroundColor: '#f97316 !important', color: '#000000', fontWeight: 'bold' }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardList;
