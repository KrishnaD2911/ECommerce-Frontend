import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createGiftCard, updateGiftCard } from '../../redux/giftCardSlice';
import giftCardService from '../../services/giftCardService';
import { HiArrowLeft, HiOutlineCreditCard, HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const GiftCardForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.giftCards);
  const maxUsageRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    balance: '',
    status: 'active',
    maxUsage: '',
    activationDate: '',
    expiryDate: '',
    minCartValue: '',
    usageCount: 0,
  });

  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      giftCardService.getGiftCardById(id).then((res) => {
        const gc = res.data;
        setFormData({
          code: gc.code,
          amount: gc.amount,
          balance: gc.balance !== null ? gc.balance : '',
          status: gc.status,
          maxUsage: gc.maxUsage || '',
          activationDate: gc.activationDate ? gc.activationDate.split('T')[0] : '',
          expiryDate: gc.expiryDate ? gc.expiryDate.split('T')[0] : '',
          minCartValue: gc.minCartValue || '',
          usageCount: gc.usageCount || 0,
        });
        setInitialLoading(false);
      }).catch((err) => {
        toast.error('Error fetching gift card details');
        navigate('/admin/gift-cards');
      });
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let updates = { [name]: value };

    if (name === 'status' && formData.status === 'redeemed' && value === 'active') {
      setTimeout(() => {
        toast(`Usage limit is currently ${formData.usageCount}. Increase Max Usage to reactivate!`, { icon: '⚠️', duration: 5000 });
        if (maxUsageRef.current) {
          maxUsageRef.current.focus();
          maxUsageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    } else if (name === 'maxUsage') {
      const maxVal = value === '' ? null : Number(value);
      if (maxVal !== null && maxVal <= formData.usageCount) {
        updates.status = 'redeemed';
      } else if (maxVal !== null && maxVal > formData.usageCount && formData.status === 'redeemed') {
        updates.status = 'active';
      } else if (maxVal === null && formData.status === 'redeemed') {
        updates.status = 'active';
      }
    } else if (name === 'activationDate') {
      if (value) {
        const actDate = new Date(value);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (actDate > today) {
          updates.status = 'inactive';
        }
      }
    }

    setFormData({ ...formData, ...updates });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'GIFT-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    result += '-';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, code: result });
  };

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalActivationDate = null;
    if (formData.activationDate) {
      finalActivationDate = new Date(`${formData.activationDate}T00:00:00Z`).toISOString();
    }

    let finalExpiryDate = null;
    if (formData.expiryDate) {
      finalExpiryDate = new Date(`${formData.expiryDate}T23:59:59Z`).toISOString();
    }

    const submitData = {
      ...formData,
      amount: Number(formData.amount),
      balance: formData.balance !== '' ? Number(formData.balance) : null,
      status: formData.status,
      maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
      activationDate: finalActivationDate,
      expiryDate: finalExpiryDate,
      minCartValue: formData.minCartValue ? Number(formData.minCartValue) : 0,
    };
    // Ensure we don't send usageCount back to backend to override it
    delete submitData.usageCount;

    if (isEdit) {
      // Don't send code on edit to prevent accidental changes, unless explicitly wanted
      delete submitData.code;
      dispatch(updateGiftCard({ id, giftCardData: submitData }))
        .unwrap()
        .then(() => {
          toast.success('Gift card updated successfully');
          navigate('/admin/gift-cards');
        })
        .catch((err) => toast.error(err || 'Update failed'));
    } else {
      dispatch(createGiftCard(submitData))
        .unwrap()
        .then(() => {
          toast.success('Gift card created successfully');
          navigate('/admin/gift-cards');
        })
        .catch((err) => toast.error(err || 'Creation failed'));
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="loader h-10 w-10 border-4 border-orange-500/30 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="mx-auto max-w-3xl px-4 pt-8">
        
        <Link to="/admin/gift-cards" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-orange-500 transition-colors">
          <HiArrowLeft /> Back to Gift Cards
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
            <HiOutlineCreditCard />
          </div>
          <div>
            <h1 className="font-title text-3xl font-black text-white">{isEdit ? 'Edit Gift Card' : 'Create Gift Card'}</h1>
            <p className="text-sm text-zinc-400">{isEdit ? 'Update existing card settings.' : 'Generate a new code and assign value.'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/5 bg-[#0f0a15] p-6 shadow-xl sm:p-10">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            <div className="form-group md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Gift Card Code</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isEdit}
                  placeholder={isEdit ? 'Code cannot be changed' : 'e.g. SUMMER2026 (Leave blank to auto-generate)'}
                  className="flex-1 rounded-xl border border-slate-700 bg-black py-3 px-4 text-white uppercase outline-none focus:bg-[#1a1225] disabled:opacity-50"
                />
                {!isEdit && (
                  <button type="button" onClick={generateRandomCode} className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 font-bold text-white hover:bg-zinc-700 transition-colors">
                    <HiOutlineRefresh /> Auto
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Initial Amount (₹)</label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                disabled={isEdit}
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225] disabled:opacity-50"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Balance (₹)</label>
              <input
                type="number"
                name="balance"
                min="0"
                placeholder="Leave blank for N/A (Promo Code mode)"
                value={formData.balance}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225]"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225]"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="form-group">
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-300">
                Max Usage (Optional)
                {isEdit && (
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400 border border-orange-500/20">
                    Current Usage: {formData.usageCount || 0}
                  </span>
                )}
              </label>
              <input
                ref={maxUsageRef}
                type="number"
                name="maxUsage"
                min="1"
                placeholder="Unlimited"
                value={formData.maxUsage}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225] focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Activation Date (Optional)</label>
              <input
                type="date"
                name="activationDate"
                min={getTodayString()}
                value={formData.activationDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225]"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Expiry Date (Optional)</label>
              <input
                type="date"
                name="expiryDate"
                min={formData.activationDate || getTomorrowString()}
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225]"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-300">Minimum Cart Value (₹) <span className="text-zinc-500 font-normal">(Optional — 0 means no minimum)</span></label>
              <input
                type="number"
                name="minCartValue"
                min="0"
                placeholder="0"
                value={formData.minCartValue}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-black py-3 px-4 text-white outline-none focus:bg-[#1a1225]"
              />
            </div>
            
          </div>

          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-white/5">
            <Link to="/admin/gift-cards" className="rounded-xl px-6 py-3 font-bold text-zinc-400 hover:text-white transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3 font-bold text-black shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-colors disabled:opacity-50"
            >
              {loading ? <div className="loader h-6 w-6 border-2 border-black/30 border-t-black"></div> : isEdit ? 'Update Gift Card' : 'Create Gift Card'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default GiftCardForm;
