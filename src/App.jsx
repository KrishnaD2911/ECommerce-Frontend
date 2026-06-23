import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import GiftCardList from './pages/admin/GiftCardList';
import GiftCardForm from './pages/admin/GiftCardForm';
import InventoryList from './pages/admin/InventoryList';
import InventoryForm from './pages/admin/InventoryForm';
import NotificationSettings from './pages/admin/NotificationSettings';
import NotificationHistory from './pages/admin/NotificationHistory';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Cart from './pages/public/Cart';
import BuyGiftCard from './pages/public/BuyGiftCard';
import Profile from './pages/public/Profile';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/authSlice';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <>
      <div className="app-container">
        <Navbar />
        <main className="main-content pt-28">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Products />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/gift-cards" element={<BuyGiftCard />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes (Protected) */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/products" element={<ProductList />} />
              <Route path="/admin/products/new" element={<ProductForm />} />
              <Route path="/admin/products/edit/:id" element={<ProductForm />} />
              <Route path="/admin/gift-cards" element={<GiftCardList />} />
              <Route path="/admin/gift-cards/new" element={<GiftCardForm />} />
              <Route path="/admin/gift-cards/edit/:id" element={<GiftCardForm />} />
              <Route path="/admin/inventory" element={<InventoryList />} />
              <Route path="/admin/inventory/new" element={<InventoryForm />} />
              <Route path="/admin/notifications" element={<NotificationSettings />} />
              <Route path="/admin/notifications/history" element={<NotificationHistory />} />
            </Route>
          </Routes>
        </main>
      </div>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      
      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #000000;
        }
        .main-content {
          flex: 1;
        }
      `}</style>
    </>
  );
}

export default App;
