import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { 
  HiOutlineCube, 
  HiOutlineShoppingBag, 
  HiOutlineViewGrid, 
  HiOutlineShoppingCart,
  HiOutlineLogout,
  HiViewGrid,
  HiShieldCheck,
  HiOutlineShieldCheck,
  HiCollection,
  HiOutlineGift,
  HiMenu,
  HiX
} from 'react-icons/hi';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? 'text-white bg-white/10'
      : 'text-zinc-400 hover:text-white hover:bg-white/5'
  }`;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="flex items-center justify-between gap-2 sm:gap-4 rounded-full border border-white/10 bg-black/50 px-3 sm:px-5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu toggle */}
          <button 
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>

          <NavLink to="/" className="flex items-center gap-2.5 text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-black shadow-lg shadow-orange-500/20">
              <HiCollection className="text-lg" />
            </span>
            <span className="font-title text-xl font-black tracking-tight hidden sm:block">ShopVault</span>
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>
            <HiViewGrid className="text-lg" />
            Browse
          </NavLink>
          <NavLink to="/gift-cards" className={navLinkClass}>
            <HiOutlineGift className="text-lg" />
            Gift Cards
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              <HiShieldCheck className="text-lg" />
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link to="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:text-white transition-colors">
            <HiOutlineShoppingCart className="text-xl" />
            {totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-black shadow-sm shadow-orange-500/50 border border-black">
                {totalQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link to="/profile" className="hidden sm:flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-full transition-colors cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-zinc-300">{user.name.split(' ')[0]}</span>
              </Link>
              <button 
                onClick={() => {
                  dispatch(logout());
                  setIsMobileMenuOpen(false);
                }}
                className="flex h-9 items-center gap-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-red-400 hover:border-red-500/30 px-3 py-1.5 text-sm font-semibold transition-colors"
                title="Logout"
              >
                <HiOutlineLogout className="text-base"/>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link to="/login" className="flex h-9 items-center rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white px-3 sm:px-4 py-1.5 text-sm font-semibold transition-colors">
                Log in
              </Link>
              <Link to="/register" className="flex h-9 items-center rounded-full bg-white text-black hover:bg-zinc-200 px-3 sm:px-4 py-1.5 text-sm font-bold shadow-md shadow-white/10 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-3 rounded-[24px] border border-white/10 bg-black/90 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl flex flex-col gap-1">
          <NavLink to="/" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <HiViewGrid className="text-lg" /> Browse
          </NavLink>
          <NavLink to="/gift-cards" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <HiOutlineGift className="text-lg" /> Gift Cards
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <HiShieldCheck className="text-lg" /> Admin
            </NavLink>
          )}
          {isAuthenticated && (
            <Link to="/profile" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              Profile ({user.name.split(' ')[0]})
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
