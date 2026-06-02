import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { purchaseGiftCard } from '../../redux/giftCardSlice';
import { HiOutlineGift, HiOutlineMail, HiOutlineUser, HiOutlineChatAlt2, HiCheck, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

const presetAmounts = [250, 500, 1000, 2000, 5000, 10000];

const BuyGiftCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { purchaseLoading } = useSelector((state) => state.giftCards);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [purchasedCard, setPurchasedCard] = useState(null);

  const finalAmount = isCustom ? Number(customAmount) : selectedAmount;

  const handleSelectPreset = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!finalAmount || finalAmount < 100) {
      toast.error('Minimum gift card value is ₹100');
      return;
    }

    if (!recipientName.trim() || !recipientEmail.trim()) {
      toast.error('Recipient name and email are required');
      return;
    }

    try {
      const result = await dispatch(
        purchaseGiftCard({
          amount: finalAmount,
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim(),
          senderName: senderName.trim(),
          message: message.trim(),
        })
      ).unwrap();

      setPurchasedCard(result.data);
      toast.success('Gift card purchased successfully!');
    } catch (err) {
      toast.error(err || 'Failed to purchase gift card');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  // Success state
  if (purchasedCard) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          {/* Success Animation */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-400 animate-bounce">
            <HiCheck className="text-5xl" />
          </div>

          <h1 className="font-title text-4xl font-black text-white mb-2">Gift Card Sent! 🎉</h1>
          <p className="text-zinc-400 font-medium mb-8">
            A gift card has been created for <span className="text-white font-bold">{purchasedCard.recipientName}</span>.
          </p>

          {/* Card Preview */}
          <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#0f0a15] to-purple-500/10 p-8 shadow-2xl shadow-orange-500/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-black text-2xl shadow-lg shadow-orange-500/30">
                  <HiOutlineGift />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">ShopVault Gift Card</p>
                  <p className="text-sm text-zinc-400">For {purchasedCard.recipientName}</p>
                </div>
              </div>

              <p className="font-title text-5xl font-black text-white mb-4">
                {formatCurrency(purchasedCard.amount)}
              </p>

              <div className="bg-black/50 rounded-xl p-4 border border-white/5 mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Gift Card Code</p>
                <p className="font-mono text-2xl font-black text-orange-500 tracking-widest">{purchasedCard.code}</p>
              </div>

              {purchasedCard.message && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-left">
                  <p className="text-xs text-zinc-500 mb-1">Personal Message:</p>
                  <p className="text-sm text-zinc-300 italic">"{purchasedCard.message}"</p>
                </div>
              )}

              <p className="text-xs text-zinc-500 mt-4">
                Expires: {new Date(purchasedCard.expiryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setPurchasedCard(null)}
              className="rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-all active:scale-95"
            >
              Buy Another
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl bg-white/5 border border-white/10 px-8 py-3.5 text-sm font-bold text-zinc-300 hover:text-white transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black pt-8 pb-10 px-4 border-b border-white/5 mb-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
            <HiOutlineGift />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-0.5 text-xs font-black text-orange-500 uppercase tracking-wide mb-3">
            <HiOutlineSparkles />
            Perfect Gift
          </div>
          <h1 className="font-title text-4xl font-black text-white sm:text-5xl">Buy a Gift Card</h1>
          <p className="mt-3 text-base font-medium text-zinc-400 max-w-md mx-auto">
            Send a digital gift card to someone special. They can redeem it instantly on any purchase!
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Amount Selection */}
          <div className="bg-[#0a0a0a] rounded-[28px] border border-white/5 p-8 shadow-xl">
            <h2 className="font-title text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 text-sm font-black">1</span>
              Choose an Amount
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPreset(amt)}
                  className={`rounded-xl border py-3.5 px-2 text-sm font-bold transition-all active:scale-95 ${
                    selectedAmount === amt && !isCustom
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-lg shadow-orange-500/10'
                      : 'border-white/10 bg-black text-zinc-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCustomToggle}
              className={`w-full rounded-xl border py-3 text-sm font-bold transition-all ${
                isCustom
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                  : 'border-white/10 bg-black text-zinc-400 hover:border-white/20 hover:text-white'
              }`}
            >
              Custom Amount
            </button>

            {isCustom && (
              <div className="mt-4 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount (min ₹100)"
                  className="w-full rounded-xl border border-white/10 bg-black py-3.5 pl-10 pr-4 text-white text-lg font-bold outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Recipient Details */}
          <div className="bg-[#0a0a0a] rounded-[28px] border border-white/5 p-8 shadow-xl">
            <h2 className="font-title text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 text-sm font-black">2</span>
              Recipient Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-zinc-300">
                  <HiOutlineUser className="text-orange-500" /> Recipient's Name
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-white/10 bg-black py-3 px-4 text-white outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-zinc-300">
                  <HiOutlineMail className="text-orange-500" /> Recipient's Email
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black py-3 px-4 text-white outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-zinc-300">
                  <HiOutlineUser className="text-zinc-400" /> Your Name <span className="text-zinc-500 text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full rounded-xl border border-white/10 bg-black py-3 px-4 text-white outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Personal Message */}
          <div className="bg-[#0a0a0a] rounded-[28px] border border-white/5 p-8 shadow-xl">
            <h2 className="font-title text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 text-sm font-black">3</span>
              Personal Message <span className="text-zinc-500 text-xs font-normal">(optional)</span>
            </h2>

            <div className="relative">
              <HiOutlineChatAlt2 className="absolute left-4 top-4 text-zinc-400" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Happy Birthday! Enjoy your shopping..."
                className="w-full rounded-xl border border-white/10 bg-black py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
              <p className="text-right text-xs text-zinc-600 mt-1">{message.length}/200</p>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="bg-[#0a0a0a] rounded-[28px] border border-white/5 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-400 font-medium">Gift Card Value:</span>
              <span className="font-title text-3xl font-black text-orange-500">
                {finalAmount ? formatCurrency(finalAmount) : '₹0'}
              </span>
            </div>

            <button
              type="submit"
              disabled={purchaseLoading || !finalAmount || finalAmount < 100 || !recipientName.trim() || !recipientEmail.trim()}
              className="w-full rounded-xl bg-orange-500 py-4 text-lg font-bold text-black shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purchaseLoading ? (
                <div className="loader h-6 w-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <HiOutlineGift className="text-xl" />
                  Purchase Gift Card
                </>
              )}
            </button>

            {!isAuthenticated && (
              <p className="mt-4 text-center text-xs font-bold text-orange-500 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                You'll need to sign in before purchasing.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyGiftCard;
