import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, clearProduct, clearError } from '../../redux/productSlice';
import { addToCart } from '../../redux/cartSlice';
import {
  HiArrowLeft,
  HiOutlineShoppingBag,
  HiOutlineArchive,
  HiOutlineTag,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiMinus,
  HiPlus,
} from 'react-icons/hi';
import { updateQuantity, removeFromCart } from '../../redux/cartSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector((state) => state.products);
  const cartItem = useSelector((state) => 
    state.cart.items.find((item) => item.product === product?._id)
  );

  useEffect(() => {
    dispatch(fetchProduct(id));
    return () => {
      dispatch(clearProduct());
      dispatch(clearError());
    };
  }, [dispatch, id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const getStockInfo = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    if (stock <= 5) return { label: `Only ${stock} left`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'In Stock', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  };

  if (loading || !product) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/10 border-t-orange-500"></div>
          <span className="text-sm font-bold text-zinc-500">Loading product...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-black p-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-8 py-6 text-center">
          <p className="text-lg font-bold text-red-400">{error}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-bold text-orange-500 hover:underline">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = product.image?.url;
  const isUnavailable = product.stock === 0 || product.status !== 'active';
  const stockInfo = getStockInfo(product.stock);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(product._id));
    } else if (newQuantity <= product.stock) {
      dispatch(updateQuantity({ id: product._id, quantity: newQuantity }));
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Breadcrumb / Back */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm font-bold text-zinc-300 transition-all hover:border-orange-500/30 hover:text-orange-500 hover:-translate-y-0.5"
        >
          <HiArrowLeft /> Back to Store
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — Image */}
          <div className="relative">
            <div className="sticky top-32 overflow-hidden rounded-[32px] border border-white/5 bg-[#0a0a0a] shadow-2xl shadow-black/50">
              {imageUrl ? (
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                <div
                  className="relative flex aspect-square w-full items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, #f97316, #f59e0b)`,
                  }}
                >
                  <div className="flex h-40 w-40 items-center justify-center rounded-[40px] bg-black/30 text-8xl font-black text-white backdrop-blur-md border border-white/20 shadow-2xl">
                    {product.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {/* Category + Status Badges */}
              <div className="absolute left-5 top-5 flex gap-2">
                <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-black text-white border border-white/10 backdrop-blur-md shadow-lg">
                  {product.category}
                </span>
                {product.status !== 'active' && (
                  <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-black text-white border border-white/10 backdrop-blur-md">
                    {product.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="flex flex-col py-2">
            {/* SKU */}
            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-500">
              <HiOutlineTag className="text-sm" />
              SKU: {product.sku}
            </div>

            {/* Name */}
            <h1 className="font-title text-4xl font-black leading-tight text-white lg:text-5xl">
              {product.name}
            </h1>

            {/* Price + Stock Row */}
            <div className="mt-6 flex flex-wrap items-end gap-6">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Price</span>
                <span className="font-title text-4xl font-black text-orange-500">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className={`rounded-full border px-4 py-2 text-sm font-black ${stockInfo.bg} ${stockInfo.color}`}>
                {stockInfo.label}
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-400">
                <HiOutlineClipboardList className="text-lg text-orange-500" />
                Description
              </h2>
              <p className="text-base leading-7 text-zinc-300">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Product Details Grid */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5">
                <span className="text-xs font-bold uppercase text-zinc-500">Category</span>
                <p className="mt-1 text-lg font-black text-white">{product.category}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5">
                <span className="text-xs font-bold uppercase text-zinc-500">Stock</span>
                <p className={`mt-1 text-lg font-black ${stockInfo.color}`}>{product.stock} units</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5">
                <span className="text-xs font-bold uppercase text-zinc-500">Status</span>
                <p className="mt-1 text-lg font-black capitalize text-white">
                  {product.status?.replace('_', ' ')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-5">
                <span className="text-xs font-bold uppercase text-zinc-500">SKU</span>
                <p className="mt-1 text-lg font-black font-mono text-white">{product.sku}</p>
              </div>
            </div>

            {/* Add to Cart */}
            {cartItem ? (
              <div className="flex h-16 w-full items-center justify-between rounded-2xl border border-orange-500/30 bg-orange-500/10 p-2 shadow-lg shadow-orange-500/10">
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                  className="flex h-12 w-16 items-center justify-center rounded-xl bg-[#0a0a0a] text-orange-500 transition-colors hover:bg-orange-500 hover:text-black text-xl"
                >
                  <HiMinus />
                </button>
                <span className="font-title text-2xl font-black text-white">{cartItem.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= product.stock}
                  className="flex h-12 w-16 items-center justify-center rounded-xl bg-[#0a0a0a] text-orange-500 transition-colors hover:bg-orange-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                >
                  <HiPlus />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isUnavailable}
                className="btn btn-primary w-full py-4 text-lg rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isUnavailable ? (
                  <>
                    <HiOutlineArchive className="text-2xl" /> Unavailable
                  </>
                ) : (
                  <>
                    <HiOutlineShoppingBag className="text-2xl" /> Add to Cart
                  </>
                )}
              </button>
            )}

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
                <HiOutlineTruck className="text-2xl text-orange-500" />
                <span className="text-xs font-bold text-zinc-400">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
                <HiOutlineShieldCheck className="text-2xl text-orange-500" />
                <span className="text-xs font-bold text-zinc-400">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 text-center">
                <HiOutlineRefresh className="text-2xl text-orange-500" />
                <span className="text-xs font-bold text-zinc-400">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
