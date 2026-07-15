import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  HiArrowLeft,
  HiOutlineCube,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineShoppingCart,
  HiOutlineSearch,
  HiSave,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const ADJUSTMENT_TYPES = [
  { value: 'manual', label: 'Manual Adjustment', icon: <HiOutlineCube />, desc: 'Add or remove stock manually', color: 'purple' },
  { value: 'return', label: 'Customer Return', icon: <HiOutlineRefresh />, desc: 'Returned items back to stock', color: 'green' },
  { value: 'damaged', label: 'Damaged Goods', icon: <HiOutlineExclamationCircle />, desc: 'Deduct damaged or defective items', color: 'red' },
];

const InventoryForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    product: '',
    type: 'manual',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/v1/products?limit=1000', authHeaders());
        setProducts(res.data.products || []);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setFetching(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: getCalculatedQuantity()
      };
      await axios.post('/api/v1/inventory', payload, authHeaders());
      toast.success('Inventory adjustment recorded!');
      navigate('/admin/inventory');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record adjustment');
    } finally {
      setLoading(false);
    }
  };

  const [productSearch, setProductSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const getCalculatedQuantity = () => {
    const rawVal = Number(formData.quantity || 0);
    if (formData.type === 'return') return Math.abs(rawVal);
    if (formData.type === 'damaged') return -Math.abs(rawVal);
    return rawVal;
  };

  const selectedProduct = products.find((p) => p._id === formData.product);
  const previewNewStock = selectedProduct
    ? selectedProduct.stock + getCalculatedQuantity()
    : null;

  const accentColors = {
    purple: 'border-purple-500 bg-purple-500/10 shadow-purple-500/10',
    green: 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10',
    red: 'border-red-500 bg-red-500/10 shadow-red-500/10',
  };
  const inactiveColors = 'border-white/10 bg-black hover:border-white/20 hover:bg-white/[0.02]';

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-transparent pt-8 pb-12 px-4 border-b border-white/5">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/inventory"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-zinc-300 shadow-sm border border-white/10 transition-all hover:border-orange-500/30 hover:text-orange-500 hover:-translate-y-0.5"
          >
            <HiArrowLeft /> Back to Ledger
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
              <HiOutlineCube />
            </div>
            <div>
              <h1 className="font-title text-4xl font-black text-white tracking-tight">
                Record Adjustment
              </h1>
              <p className="mt-1 text-zinc-400 font-medium text-lg">
                Manually adjust stock for a product.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 -mt-6 relative z-10">
        {fetching ? (
          <div className="flex justify-center py-20 bg-[#0a0a0a] rounded-[32px] border border-white/5">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/10 border-t-orange-500" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-6 md:p-10 space-y-8"
          >
            {/* Product Select (Searchable) */}
            <div className="relative" ref={dropdownRef}>
              <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-zinc-300">
                Product
              </label>
              <div 
                className="w-full rounded-xl border border-white/10 bg-black py-3.5 px-4 text-white outline-none focus-within:border-orange-500/50 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedProduct ? (
                  <span className="font-medium text-white">{selectedProduct.name} <span className="text-zinc-500 ml-2 font-mono text-sm">{selectedProduct.sku}</span></span>
                ) : (
                  <span className="text-zinc-600 font-medium">Search and select a product...</span>
                )}
                <svg className={`w-5 h-5 text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>

              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-3 border-b border-white/5">
                    <div className="relative">
                       <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                       <input 
                         type="text" 
                         autoFocus
                         placeholder="Search product name or SKU..." 
                         value={productSearch}
                         onChange={(e) => setProductSearch(e.target.value)}
                         className="w-full bg-black border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-orange-500/50"
                       />
                    </div>
                  </div>
                  <ul className="max-h-60 overflow-y-auto p-2">
                    {filteredProducts.length === 0 ? (
                      <li className="p-4 text-center text-sm font-medium text-zinc-500">No matching products found.</li>
                    ) : (
                      filteredProducts.map(p => (
                        <li 
                          key={p._id}
                          onClick={() => {
                             setFormData({...formData, product: p._id});
                             setDropdownOpen(false);
                             setProductSearch('');
                          }}
                          className={`p-3 mb-1 rounded-lg cursor-pointer text-sm transition-colors hover:bg-orange-500/10 hover:text-orange-400 ${formData.product === p._id ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-zinc-300 font-medium'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{p.name}</span>
                            <span className="text-xs font-mono text-zinc-500">{p.sku}</span>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Selected Product Preview */}
            {selectedProduct && (
              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#0a0a0a] border border-white/5 flex-shrink-0">
                    {selectedProduct.image?.url ? (
                      <img
                        src={selectedProduct.image.url}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600">
                        <HiOutlineCube size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{selectedProduct.name}</h3>
                    <p className="text-xs font-mono text-zinc-500">{selectedProduct.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-white">{selectedProduct.stock}</p>
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Current Stock</p>
                  </div>
                </div>

                {/* Live Preview of New Stock */}
                {formData.quantity && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-500">After Adjustment</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500">{selectedProduct.stock}</span>
                      <span className="text-zinc-600">→</span>
                      <span
                        className={`text-xl font-black ${
                          previewNewStock < 0
                            ? 'text-red-400'
                            : previewNewStock === 0
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {previewNewStock}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Adjustment Type Cards */}
            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-zinc-300">
                Adjustment Type
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {ADJUSTMENT_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                      formData.type === t.value
                        ? `${accentColors[t.color]} shadow-md`
                        : inactiveColors
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      checked={formData.type === t.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2 text-2xl">{t.icon}</div>
                      <span className="text-sm font-black text-white">{t.label}</span>
                      <span className="mt-1 text-[11px] text-zinc-500">{t.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-zinc-300">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                required
                placeholder="e.g. 10 or -5"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black py-3.5 px-4 text-xl font-black text-white outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600 placeholder:font-normal placeholder:text-base"
              />
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Use <span className="text-emerald-400 font-bold">positive</span> numbers to add stock,{' '}
                <span className="text-red-400 font-bold">negative</span> numbers to deduct.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-zinc-300">
                Notes <span className="text-zinc-600 normal-case">(Optional)</span>
              </label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Reason for adjustment..."
                className="w-full rounded-xl border border-white/10 bg-black py-3.5 px-4 text-sm text-white outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="rounded-2xl bg-black border border-white/5 p-6 flex items-center justify-end gap-4">
              <Link
                to="/admin/inventory"
                className="rounded-xl border border-white/10 bg-[#0a0a0a] px-6 py-3 text-sm font-bold text-zinc-300 transition-all hover:text-white hover:border-white/30"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.product || !formData.quantity}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <HiSave className="text-lg" />
                )}
                Save Adjustment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InventoryForm;
