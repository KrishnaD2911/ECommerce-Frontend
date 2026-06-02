/**
 * Auth Service
 * Reads the real JWT token from localStorage (set by authSlice on login).
 * Provides the expected interface for productService interceptors.
 */
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  return { token };
};

const authService = {
  getCurrentUser,
};

export default authService;
