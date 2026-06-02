import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearAuthError } from '../../redux/authSlice';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/5 bg-[#0a0a0a] p-8 shadow-2xl shadow-orange-500/10 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
            <HiOutlineLockClosed />
          </div>
          <h1 className="font-title text-3xl font-black text-white">Welcome Back</h1>
          <p className="mt-2 text-sm font-medium text-zinc-400">Sign in to continue shopping or manage your store.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-bold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group relative">
            <label className="mb-2 block text-sm font-bold text-zinc-300">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none">
                <HiOutlineMail />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-[#0f0a15] py-3 pl-14 pr-4 text-white outline-none focus:bg-[#1a1225]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="form-group relative">
            <label className="mb-2 block text-sm font-bold text-zinc-300">
              Password
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none">
                <HiOutlineLockClosed />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-[#0f0a15] py-3 pl-14 pr-12 text-white outline-none focus:bg-[#1a1225]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
              >
                {showPassword ? <HiOutlineEyeOff className="text-xl" /> : <HiOutlineEye className="text-xl" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 text-base rounded-xl shadow-lg shadow-orange-500/30 mt-4 flex justify-center"
          >
            {loading ? <div className="loader h-6 w-6 border-2 border-black/30 border-t-black"></div> : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-500 hover:text-orange-400 hover:underline">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
