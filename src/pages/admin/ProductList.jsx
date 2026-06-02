import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchProducts,
  removeProduct,
  restoreProduct,
  bulkRemoveProducts,
  bulkPriceUpdate,
  bulkStatusUpdate,
  bulkStockUpdate,
  setPage,
  setFilters,
} from '../../redux/productSlice';
import SearchBar from '../../components/SearchBar';
import Filters from '../../components/Filters';
import ProductTable from '../../components/ProductTable';
import BulkToolbar from '../../components/BulkToolbar';
import { HiPlus, HiChevronLeft, HiChevronRight, HiOutlineViewGrid, HiOutlineCollection, HiArrowUp, HiArrowDown, HiSelector } from 'react-icons/hi';
import Pagination from '@mui/material/Pagination';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, loading, error, page, pages, filters, totalProducts } = useSelector((state) => state.products);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, page, filters]);

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? products.map(p => p._id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter(itemId => itemId !== id) : [...current, id]
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(removeProduct(id));
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    }
  };

  const handleRestore = (id) => {
    dispatch(restoreProduct(id)).then(() => {
      dispatch(fetchProducts());
    });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      dispatch(bulkRemoveProducts(selectedIds)).then(() => {
        setSelectedIds([]);
      });
    }
  };

  const handleBulkPriceUpdate = (percentage) => {
    dispatch(bulkPriceUpdate({ ids: selectedIds, percentage })).then(() => {
      dispatch(fetchProducts());
      setSelectedIds([]);
    });
  };

  const handleBulkStatusUpdate = (status) => {
    dispatch(bulkStatusUpdate({ ids: selectedIds, status })).then(() => {
      dispatch(fetchProducts());
      setSelectedIds([]);
    });
  };

  const handleBulkStockUpdate = (stock) => {
    dispatch(bulkStockUpdate({ ids: selectedIds, stock })).then(() => {
      dispatch(fetchProducts());
      setSelectedIds([]);
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      dispatch(setPage(newPage));
    }
  };

  const handleSort = (field) => {
    let newSort = field;
    if (filters.sort === field) {
      newSort = `-${field}`;
    } else if (filters.sort === `-${field}`) {
      newSort = '';
    }
    dispatch(setFilters({ sort: newSort }));
  };

  const getSortIcon = (field) => {
    if (filters.sort === field) return <HiArrowUp className="inline ml-1 text-orange-500" />;
    if (filters.sort === `-${field}`) return <HiArrowDown className="inline ml-1 text-orange-500" />;
    return <HiSelector className="inline ml-1 text-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />;
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      
      {/* Black Header */}
      <div className="bg-black pt-8 pb-10 px-4 border-b border-white/5 mb-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-black shadow-lg shadow-orange-500/30">
              <HiOutlineCollection />
            </div>
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-0.5 text-xs font-black text-orange-500 uppercase tracking-wide">
                <HiOutlineViewGrid />
                Inventory
              </div>
              <h1 className="font-title text-4xl font-black text-white tracking-tight">Manage Products</h1>
              <p className="mt-1 text-base font-medium text-zinc-500">{totalProducts} products in the current view</p>
            </div>
          </div>
          
          <div>
            <Link to="/admin/products/new" className="btn btn-primary px-6 shadow-lg shadow-orange-500/20 flex items-center gap-2">
              <HiPlus className="text-lg" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        
        {/* Search & Filters Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="bg-[#0a0a0a] rounded-[24px] border border-white/5 shadow-sm p-2">
            <Filters />
          </div>
          <aside className="bg-[#0a0a0a] rounded-[24px] border border-white/5 shadow-sm p-5 flex flex-col justify-center">
            <label className="mb-3 block text-sm font-bold text-zinc-300 uppercase tracking-wide">Quick Search</label>
            <SearchBar />
          </aside>
        </div>  

        <BulkToolbar
          selectedCount={selectedIds.length}
          onDelete={handleBulkDelete}
          onPriceUpdate={handleBulkPriceUpdate}
          onStatusUpdate={handleBulkStatusUpdate}
          onStockUpdate={handleBulkStockUpdate}
          onClearSelection={() => setSelectedIds([])}
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 font-bold text-red-400 shadow-sm">
            {error}
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="flex justify-center py-24 bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-sm">
            <div className="loader" />
          </div>
        ) : (
          <div className="bg-[#0a0a0a] rounded-[32px] border border-white/5 shadow-xl shadow-black/50 overflow-hidden">
            <ProductTable
              products={products}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onSort={handleSort}
              getSortIcon={getSortIcon}
            />

            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 bg-black p-6">
                <span className="text-sm font-black text-zinc-500">
                  Page <span className="text-orange-500">{page}</span> of {pages}
                </span>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
