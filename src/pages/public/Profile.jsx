import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, updateOrderStatus } from '../../redux/orderSlice';
import { fetchMyGiftCards } from '../../redux/giftCardSlice';
import { HiOutlineUser, HiOutlineShoppingBag, HiOutlineCalendar, HiOutlineMail, HiOutlineRefresh, HiOutlineReply, HiOutlineGift, HiOutlineTicket } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { myGiftCards, myGiftCardsLoading } = useSelector((state) => state.giftCards);

  const [showAllGiftCards, setShowAllGiftCards] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
    dispatch(fetchMyGiftCards());
  }, [dispatch]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-title text-4xl font-black text-white mb-8 tracking-tight">Your Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* User Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-8">
            <div className="flex flex-col items-center border-b border-white/5 pb-6 mb-6">
              <div className="h-24 w-24 rounded-full bg-orange-500/15 text-orange-500 flex items-center justify-center text-4xl font-black mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-title text-2xl font-black text-white">{user?.name}</h2>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-zinc-300 uppercase">
                {user?.role}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-400">
                <HiOutlineMail className="text-xl text-orange-500" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <HiOutlineCalendar className="text-xl text-orange-500" />
                <span className="font-medium">Joined {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
              </div>
            </div>
          </div>

          {/* My Gift Cards Section */}
          <div className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <HiOutlineGift className="text-xl" />
              </div>
              <h2 className="font-title text-xl font-black text-white">My Gift Cards</h2>
            </div>

            {myGiftCardsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : myGiftCards?.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-zinc-500 text-sm font-medium mb-4">You don't have any gift cards.</p>
                <Link to="/gift-cards" className="text-orange-500 hover:text-orange-400 text-sm font-bold flex items-center justify-center gap-2">
                  <HiOutlineTicket /> Buy a Gift Card
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myGiftCards.slice(0, showAllGiftCards ? myGiftCards.length : 3).map(card => {
                  const isReceived = card.recipientEmail === user?.email;
                  const isSender = card.createdBy === user?._id && card.isPurchased;
                  
                  return (
                    <div key={card._id} className="rounded-2xl border border-white/5 bg-black p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-mono text-sm font-bold text-white tracking-widest">{card.code}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {isReceived && card.senderName ? `From: ${card.senderName}` : isSender && card.recipientName ? `Sent to: ${card.recipientName}` : 'Store Credit'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          card.status === 'active' ? 'bg-green-500/10 text-green-400' :
                          card.status === 'redeemed' ? 'bg-zinc-800 text-zinc-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {card.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Balance</p>
                          <p className={`font-black text-lg ${card.balance > 0 ? 'text-orange-500' : 'text-zinc-500'}`}>
                            {formatCurrency(card.balance)}
                          </p>
                        </div>
                        {card.balance < card.amount && (
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Initial</p>
                            <p className="font-bold text-sm text-zinc-400">{formatCurrency(card.amount)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {myGiftCards.length > 3 && (
                  <button
                    onClick={() => setShowAllGiftCards(!showAllGiftCards)}
                    className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-orange-500 text-sm font-bold transition-colors"
                  >
                    {showAllGiftCards ? 'Show Less' : `View All (${myGiftCards.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <HiOutlineShoppingBag className="text-2xl" />
            </div>
            <h2 className="font-title text-3xl font-black text-white">Order History</h2>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 font-bold text-red-400 shadow-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-[24px] border border-white/5 bg-[#0a0a0a] p-6 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-[24px] border border-white/5 bg-[#0a0a0a] p-12 text-center shadow-xl shadow-black/50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <HiOutlineShoppingBag className="text-3xl" />
              </div>
              <h3 className="font-title text-xl font-black text-white">No Orders Yet</h3>
              <p className="mt-2 text-zinc-400">Looks like you haven't made your first purchase.</p>
              <Link to="/products" className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.slice(0, showAllOrders ? orders.length : 3).map((order) => {
                const orderDate = new Date(order.createdAt);
                const isEligibleForReturn = (new Date() - orderDate) <= 7 * 24 * 60 * 60 * 1000;
                
                return (
                <div key={order._id} className="bg-[#0a0a0a] rounded-[24px] border border-white/5 shadow-xl shadow-black/50 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-black border-b border-white/5 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-sm">
                    <div className="flex gap-8">
                      <div>
                        <span className="block text-zinc-500 font-medium">Order Placed</span>
                        <span className="font-bold text-white">{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500 font-medium">Total</span>
                        <span className="font-bold text-white">{formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-zinc-500 font-medium">Order # {order._id.substring(order._id.length - 8).toUpperCase()}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase mt-1 ${order.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-500'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/50 flex items-center justify-center">
                             {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                             ) : (
                                <span className="font-bold text-zinc-500">{item.name.charAt(0)}</span>
                             )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white hover:text-orange-500 transition-colors">
                              <Link to="/">{item.name}</Link>
                            </h4>
                            <div className="text-orange-500 font-black mt-1">{formatCurrency(item.price)}</div>
                            <div className="text-sm font-medium text-zinc-500 mt-1">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  {isEligibleForReturn && order.status === 'completed' && (
                    <div className="bg-black/30 border-t border-white/5 px-6 py-4 flex flex-wrap justify-end gap-3">
                      <button 
                        onClick={() => {
                          dispatch(updateOrderStatus({ id: order._id, status: 'return_requested' }))
                            .unwrap()
                            .then(() => toast.success('Return request initiated. We will email you the instructions.'))
                            .catch((err) => toast.error(err || 'Failed to request return'));
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-orange-500/50 hover:text-orange-500"
                      >
                        <HiOutlineReply className="text-lg" /> Return Items
                      </button>
                      <button 
                        onClick={() => {
                          dispatch(updateOrderStatus({ id: order._id, status: 'exchange_requested' }))
                            .unwrap()
                            .then(() => toast.success('Exchange request initiated. Please check your email.'))
                            .catch((err) => toast.error(err || 'Failed to request exchange'));
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-orange-500/50 hover:text-orange-500"
                      >
                        <HiOutlineRefresh className="text-lg" /> Exchange
                      </button>
                    </div>
                  )}
                  {order.status === 'return_requested' && (
                    <div className="bg-orange-500/10 border-t border-white/5 px-6 py-4 text-orange-500 text-sm font-bold flex justify-end">
                      Return Request Pending
                    </div>
                  )}
                  {order.status === 'exchange_requested' && (
                    <div className="bg-orange-500/10 border-t border-white/5 px-6 py-4 text-orange-500 text-sm font-bold flex justify-end">
                      Exchange Request Pending
                    </div>
                  )}
                </div>
              )})}
              {orders.length > 3 && (
                <button
                  onClick={() => setShowAllOrders(!showAllOrders)}
                  className="w-full mt-2 py-4 rounded-[24px] bg-[#0a0a0a] hover:bg-white/5 border border-white/5 text-orange-500 font-bold transition-colors"
                >
                  {showAllOrders ? 'Show Less' : `View All Orders (${orders.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
