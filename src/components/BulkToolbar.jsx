import { useState } from 'react';
import { HiTrash, HiCurrencyDollar, HiTag, HiX, HiOutlineCube } from 'react-icons/hi';

const BulkToolbar = ({
  selectedCount,
  onDelete,
  onPriceUpdate,
  onStatusUpdate,
  onStockUpdate,
  onClearSelection,
}) => {
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [pricePercentage, setPricePercentage] = useState('');
  const [showStatusInput, setShowStatusInput] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  const [showStockInput, setShowStockInput] = useState(false);
  const [stockValue, setStockValue] = useState('');

  if (selectedCount === 0) return null;

  const handlePriceApply = () => {
    if (pricePercentage && !isNaN(pricePercentage)) {
      onPriceUpdate(Number(pricePercentage));
      setShowPriceInput(false);
      setPricePercentage('');
    }
  };

  const handleStatusApply = () => {
    if (statusValue) {
      onStatusUpdate(statusValue);
      setShowStatusInput(false);
      setStatusValue('');
    }
  };

  const handleStockApply = () => {
    if (stockValue && !isNaN(stockValue) && Number(stockValue) >= 0) {
      onStockUpdate(Number(stockValue));
      setShowStockInput(false);
      setStockValue('');
    }
  };

  return (
    <div className="sticky top-20 z-40 mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a] p-3 text-white shadow-2xl shadow-black/50 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-orange-500 px-3 py-2 text-sm font-black text-black">
          {selectedCount} selected
        </span>

        <button onClick={onDelete} className="btn btn-danger py-2">
          <HiTrash /> Delete
        </button>

        {!showPriceInput ? (
          <button
            onClick={() => { setShowPriceInput(true); setShowStatusInput(false); setShowStockInput(false); }}
            className="btn border-white/10 bg-white/5 py-2 text-white hover:bg-white/10"
          >
            <HiCurrencyDollar /> Price
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-black border border-white/10 p-1">
            <input
              type="number"
              placeholder="+10"
              className="form-control h-9 min-h-9 w-24 rounded-lg py-1"
              value={pricePercentage}
              onChange={(e) => setPricePercentage(e.target.value)}
            />
            <span className="text-sm font-black text-zinc-500">%</span>
            <button onClick={handlePriceApply} className="btn btn-primary h-9 min-h-9 px-3 py-1 text-xs">Apply</button>
          </div>
        )}

        {!showStatusInput ? (
          <button
            onClick={() => { setShowStatusInput(true); setShowPriceInput(false); setShowStockInput(false); }}
            className="btn border-white/10 bg-white/5 py-2 text-white hover:bg-white/10"
          >
            <HiTag /> Status
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-black border border-white/10 p-1">
            <select className="form-control h-9 min-h-9 rounded-lg py-1" value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
              <option value="">Select</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <button onClick={handleStatusApply} className="btn btn-primary h-9 min-h-9 px-3 py-1 text-xs">Apply</button>
          </div>
        )}

        {!showStockInput ? (
          <button
            onClick={() => { setShowStockInput(true); setShowPriceInput(false); setShowStatusInput(false); }}
            className="btn border-white/10 bg-white/5 py-2 text-white hover:bg-white/10"
          >
            <HiOutlineCube /> Stock
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-black border border-white/10 p-1">
            <input
              type="number"
              placeholder="Qty"
              min="0"
              className="form-control h-9 min-h-9 w-20 rounded-lg py-1"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
            />
            <button onClick={handleStockApply} className="btn btn-primary h-9 min-h-9 px-3 py-1 text-xs">Apply</button>
          </div>
        )}
      </div>

      <button onClick={onClearSelection} className="btn border-white/10 bg-white/5 py-2 text-white hover:bg-white/10" title="Clear selection">
        <HiX /> Clear
      </button>
    </div>
  );
};

export default BulkToolbar;
