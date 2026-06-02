import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../redux/productSlice';
import { HiSearch } from 'react-icons/hi';

const SearchBar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filters.search]);

  return (
    <div className="relative w-full">
      <HiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-500" />
        <input
          type="text"
          placeholder="Search name or SKU"
          className="w-full rounded-xl border border-white/10 bg-black py-3 pl-11 pr-4 text-white outline-none focus:bg-[#0a0a0a]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
    </div>
  );
};

export default SearchBar;
