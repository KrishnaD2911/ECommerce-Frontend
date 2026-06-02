import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart, checkout, applyGiftCard, removeGiftCard } from '../../redux/cartSlice';
import { HiOutlineShoppingCart, HiOutlineTrash, HiOutlineArrowRight, HiOutlineGift, HiX, HiOutlineCheckCircle } from 'react-icons/hi';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalQuantity, subtotal, tax, totalPrice, totalBeforeDiscount, appliedGiftCard, loading, giftCardLoading, error } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [giftCardCode, setGiftCardCode] = useState('');

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(checkout()).unwrap().then(() => {
      navigate('/profile');
    });
  };

  const handleApplyGiftCard = (e) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(applyGiftCard({ code: giftCardCode.trim(), cartTotal: totalBeforeDiscount || (subtotal + tax) }));
  };

  const handleRemoveGiftCard = () => {
    dispatch(removeGiftCard());
    setGiftCardCode('');
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
          <HiOutlineShoppingCart className="text-5xl" />
        </div>
        <h2 className="font-title text-3xl font-black text-white">Your cart is empty</h2>
        <p className="mt-2 text-zinc-400 font-medium">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary mt-8 px-8 py-3 shadow-lg shadow-orange-500/20">
          Start Shopping
        </Link>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-title text-4xl font-black text-white mb-8 tracking-tight">Shopping Cart</h1>

      {error && (
        <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 font-bold text-red-400 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product} className="flex flex-col sm:flex-row items-center gap-6 bg-[#0a0a0a] p-4 rounded-[24px] border border-white/5 shadow-sm">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[16px] bg-black/50 border border-white/5 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <HiOutlineShoppingCart className="text-3xl text-zinc-500" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <Link to={`/`} className="font-bold text-lg text-white hover:text-orange-500">{item.name}</Link>
                <div className="font-black text-orange-500 mt-1">{formatCurrency(item.price)}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-white/10 bg-black p-1">
                  <button 
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0a0a] text-zinc-300 shadow-sm hover:text-orange-500 disabled:opacity-50"
                    onClick={() => dispatch(updateQuantity({ id: item.product, quantity: item.quantity - 1 }))}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-white">{item.quantity}</span>
                  <button 
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0a0a] text-zinc-300 shadow-sm hover:text-orange-500 disabled:opacity-50"
                    onClick={() => dispatch(updateQuantity({ id: item.product, quantity: item.quantity + 1 }))}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  onClick={() => dispatch(removeFromCart(item.product))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
                  title="Remove item"
                >
                  <HiOutlineTrash className="text-lg" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <button 
              onClick={() => dispatch(clearCart())}
              className="text-sm font-bold text-zinc-500 hover:text-red-400 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-8 sticky top-24">
            <h2 className="font-title text-2xl font-black text-white mb-6 border-b border-white/5 pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-zinc-400 font-medium">
              <div className="flex justify-between">
                <span>Items ({totalQuantity}):</span>
                <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%):</span>
                <span className="font-bold text-white">{formatCurrency(tax)}</span>
              </div>

              {/* Gift Card Discount */}
              {appliedGiftCard && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HiOutlineGift className="text-green-400" />
                    <span className="text-green-400 font-bold text-sm">Gift Card ({appliedGiftCard.code})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-400">-{formatCurrency(appliedGiftCard.discount)}</span>
                    <button onClick={handleRemoveGiftCard} className="text-zinc-500 hover:text-red-400 transition-colors" title="Remove gift card">
                      <HiX className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-end">
              <span className="font-bold text-white">Total:</span>
              <span className="font-title text-3xl font-black text-orange-500">{formatCurrency(totalPrice)}</span>
            </div>

            {/* Gift Card Input */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <label className="flex items-center gap-2 mb-3 text-sm font-bold text-zinc-300">
                <HiOutlineGift className="text-orange-500" />
                Gift Card or Promo Code
              </label>
              {appliedGiftCard ? (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <HiOutlineCheckCircle className="text-green-400 text-xl shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-400">{appliedGiftCard.code} applied!</p>
                    <p className="text-xs text-zinc-400">Remaining balance: {formatCurrency(appliedGiftCard.balance - appliedGiftCard.discount)}</p>
                  </div>
                  <button onClick={handleRemoveGiftCard} className="text-zinc-400 hover:text-red-400 p-1 transition-colors">
                    <HiX />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyGiftCard} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter gift card code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border border-slate-700 bg-black py-2.5 px-4 text-white uppercase text-sm outline-none focus:border-orange-500/50 focus:bg-[#1a1225] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={giftCardLoading || !giftCardCode.trim()}
                    className="rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {giftCardLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn btn-primary w-full mt-8 py-4 text-lg rounded-[16px] shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2"
            >
              {loading ? <div className="loader h-6 w-6 border-2 border-black/30 border-t-black"></div> : (
                <>Checkout <HiOutlineArrowRight /></>
              )}
            </button>
            
            {!isAuthenticated && (
              <p className="mt-4 text-center text-xs font-bold text-orange-500 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                You will be asked to sign in before completing your purchase.
              </p>
            )}

            {/* Gift Card Promo */}
            <Link
              to="/gift-cards"
              className="mt-4 flex items-center gap-3 rounded-xl border border-white/5 bg-gradient-to-r from-orange-500/5 to-purple-500/5 p-4 hover:border-orange-500/20 transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                <HiOutlineGift className="text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">🎁 Send a Gift Card</p>
                <p className="text-xs text-zinc-400">Perfect for any occasion. Buy now!</p>
              </div>
              <HiOutlineArrowRight className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
