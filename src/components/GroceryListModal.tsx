import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  Plus, 
  ShoppingCart, 
  Copy, 
  CheckCheck, 
  Printer, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { GroceryItem } from '../types';

interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (name: string, category: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export const GroceryListModal: React.FC<GroceryListModalProps> = ({
  isOpen,
  onClose,
  items,
  onToggleItem,
  onRemoveItem,
  onAddItem,
  onClearCompleted,
  onClearAll
}) => {
  if (!isOpen) return null;

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [copied, setCopied] = useState(false);

  const categories = [
    'Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Bakery & Grains',
    'Pantry & Spices',
    'Oils & Condiments'
  ];

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newItemCategory);
    setNewItemName('');
  };

  const handleCopyFormatted = () => {
    if (items.length === 0) return;
    let text = `🛒 My 100 Recipes Shopping List:\n\n`;
    categories.forEach(cat => {
      const catItems = items.filter(i => (i.category || 'Produce') === cat);
      if (catItems.length > 0) {
        text += `[${cat.toUpperCase()}]\n`;
        catItems.forEach(i => {
          text += `${i.checked ? '✓ ' : '• '}${i.amount ? `${i.amount} ${i.unit || ''} ` : ''}${i.name}${i.recipeTitle ? ` (for ${i.recipeTitle})` : ''}\n`;
        });
        text += `\n`;
      }
    });
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="grocery-modal-container"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Grocery Shopping List
              </h2>
              <p className="text-xs text-stone-500">
                {items.length} items total ({checkedCount} checked)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <>
                <button
                  onClick={handleCopyFormatted}
                  title="Copy formatted list"
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  title="Print grocery list"
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer hidden sm:block"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              id="btn-close-grocery-modal"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add custom item form */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200">
          <form onSubmit={handleAddNew} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add custom grocery item (e.g., 2 bunches of scallions)..."
              className="flex-1 px-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-900"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white rounded-xl border border-stone-200 text-stone-700 cursor-pointer focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </form>
        </div>

        {/* Scrollable Items Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-800">
                Your Shopping List is Empty
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Browse any of the 100 recipes and click "Add All Ingredients to Shopping List" to auto-populate your groceries!
              </p>
            </div>
          ) : (
            categories.map(cat => {
              const catItems = items.filter(i => (i.category || 'Produce') === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between pb-1 border-b border-stone-100">
                    <span>{cat}</span>
                    <span className="text-[10px] font-medium">{catItems.length} items</span>
                  </div>

                  <div className="space-y-1.5">
                    {catItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          item.checked 
                            ? 'bg-stone-50 border-stone-200/60 text-stone-400' 
                            : 'bg-white border-stone-200 text-stone-800 hover:border-emerald-300'
                        }`}
                      >
                        <div 
                          onClick={() => onToggleItem(item.id)}
                          className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            item.checked 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-stone-300 bg-white'
                          }`}>
                            {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <span className={`text-xs font-medium ${item.checked ? 'line-through' : 'font-semibold'}`}>
                              {item.amount ? `${item.amount} ${item.unit || ''} ` : ''}{item.name}
                            </span>
                            {item.recipeTitle && (
                              <span className="text-[10px] text-stone-400 block">
                                for {item.recipeTitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        {items.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
            <button
              onClick={onClearCompleted}
              disabled={checkedCount === 0}
              className="text-stone-600 hover:text-stone-900 font-semibold cursor-pointer disabled:opacity-40"
            >
              Clear Checked ({checkedCount})
            </button>

            <button
              onClick={onClearAll}
              className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              Clear Entire List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
