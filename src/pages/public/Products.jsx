import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters, clearFilters, setPage } from '../../redux/productSlice';
import ProductCard from '../../components/ProductCard';
import { HiSearch, HiChevronLeft, HiChevronRight, HiFilter, HiOutlineSparkles } from 'react-icons/hi';
import { io } from 'socket.io-client';
import FloatingLines from '../../components/Lines';
import Pagination from '@mui/material/Pagination';

const ENABLED_WAVES = ["top","middle","bottom"];

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error, page, pages, filters, totalProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearFilters());
    };
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filters.search]);

  // Fetch products when page or filters change
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, page, filters]);

  // Setup socket connection once on mount
  useEffect(() => {
    const socket = io('http://localhost:5080');
    
    socket.on('products_updated', () => {
      dispatch(fetchProducts());
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleSortChange = (e) => {
    dispatch(setFilters({ sort: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value }));
  };

  const handleStatusChange = (e) => {
    dispatch(setFilters({ status: e.target.value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      dispatch(setPage(newPage));
    }
  };

  return (
    <div className="relative min-h-screen bg-black pb-20">    
      {/* Hero Section with Floating Lines */}
      <section className="relative overflow-hidden bg-black px-4 pt-32 pb-28">
        <div className="absolute inset-0 z-0">
          <FloatingLines
            enabledWaves={ENABLED_WAVES}
            // Array - specify line count per wave; Number - same count for all waves
            lineCount={8}
            // Array - specify line distance per wave; Number - same distance for all waves
            lineDistance={8}
            bendRadius={8}
            bendStrength={-2}
            interactive
            parallax={true}
            animationSpeed={1}
            gradientStart="#d14d06"
            gradientMid="#fa7c22"
            gradientEnd="#f79c52"
          />
        </div>
        
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black to-transparent z-[1]"></div>
        
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black to-transparent z-[1]"></div>

        <div className="mx-auto max-w-7xl relative z-10 pointer-events-none mt-4">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto pointer-events-auto">
            
            <h1 className=" relative font-title text-5xl md:text-7xl font-black tracking-tight text-black leading-tight mb-6 drop-shadow-[0_0_10px_white]">
              Curated Gear for <br/> </h1>
              <h1 className="font-title text-5xl md:text-7xl font-black tracking-tight text-black leading-tight mb-6 drop-shadow-[0_0_10px_black]">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_black]">
                Modern Lifestyles.
              </span>
            </h1>
            
            <p className="max-w-2xl text-lg md:text-xl text-black mb-10 leading-relaxed">
              Discover our hand-picked selection of premium electronics, apparel, and everyday essentials designed to elevate your routine.
            </p>

            <div className="flex items-center gap-4">
              <div className="w-full max-w-lg relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center bg-[#0a0a0a]/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl pl-5 pr-2 py-1.5">
                  <HiSearch className="text-xl text-orange-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="h-10 w-full bg-transparent text-base font-medium text-white placeholder:text-zinc-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="h-10 px-5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-black font-bold text-sm transition-colors hover:bg-zinc-200 shadow-md shadow-white/10 shrink-0">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </section>

      {/* Main Catalog Area */}
      <main className="mx-auto max-w-7xl px-4 pt-4">
        {/* Filters Bar */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-sm p-4 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <HiFilter className="text-xl" />
            </div>
            <div>
              <h2 className="font-title text-lg font-black text-white leading-tight">Catalog</h2>
              <p className="text-sm font-medium text-zinc-500">{totalProducts} active items</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <select 
              className="h-11 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all min-w-[140px]" 
              value={filters.status || ''} 
              onChange={handleStatusChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select 
              className="h-11 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all min-w-[160px]" 
              value={filters.category || ''} 
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
              <option value="Beauty">Beauty</option>
              <option value="Automotive">Automotive</option>
            </select>

            <select 
              className="h-11 rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all min-w-[180px]" 
              value={filters.sort || '-createdAt'} 
              onChange={handleSortChange}
            >
              <option value="-createdAt">Newest Arrivals</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center font-bold text-red-400 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[430px] rounded-2xl border border-white/5 bg-[#0a0a0a] p-4 shadow-sm">
                <div className="h-52 w-full animate-pulse rounded-xl bg-black/50" />
                <div className="mt-6 space-y-4 px-2">
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/5" />
                  <div className="h-6 w-4/5 animate-pulse rounded-full bg-white/5" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
                  <div className="h-6 w-1/2 animate-pulse rounded-full bg-white/5 mt-6" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[32px] border border-white/5 bg-[#0a0a0a] py-24 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/10">
              <HiSearch className="text-5xl text-orange-500" />
            </div>
            <h3 className="font-title text-3xl font-black text-white">No products found</h3>
            <p className="mx-auto mt-3 max-w-md text-lg text-zinc-400 font-medium">
              We couldn't find anything matching your current filters. Try adjusting your search.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                dispatch(clearFilters());
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-black shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-16 flex justify-center">
                <Pagination 
                                  count={pages} 
                                  page={page} 
                                  onChange={(e, value) => handlePageChange(value)} 
                                  variant="outlined" 
                                  color="orange"
                                  size="large"
                                  sx={{
                                    '& .MuiPaginationItem-root': {
                                      color: '#ff8800', 
                                      borderColor: 'rgb(217, 105, 0)',
                                    },
                                    '& .Mui-selected': {
                                      backgroundColor: 'rgba(240, 109, 15, 0.94) !important', 
                                      borderColor: 'rgba(255, 106, 0, 0.96)',
                                      color: '#000000', 
                                    },
                                    '& .MuiPaginationItem-root:hover': {
                                      backgroundColor: 'rgba(255, 106, 0, 0.05)',
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>    
  );
};

export default Products;
