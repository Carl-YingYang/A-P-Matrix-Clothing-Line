import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, X, Pencil, CheckCircle } from 'lucide-react'; // 🔥 IDINAGDAG ANG CheckCircle DITO
import { useDialog } from '../components/DialogProvider'; 

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  status: string;
}

const Inventory = () => {
  const { showAlert } = useDialog(); 

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // States
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [editStock, setEditStock] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Fabric',
    stock: '',
    unit: 'Rolls'
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inventory`);
      if (res.ok) setInventory(await res.json());
    } catch (error) { console.error("Failed to fetch inventory:", error); }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.stock) return;

    const stockNum = Number(newItem.stock);
    const newStatus = stockNum <= 5 ? 'Critical' : stockNum < 15 ? 'Low' : 'Good';
    const generatedSKU = `MAT-${Date.now().toString().slice(-4)}`; 

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: generatedSKU,
          name: newItem.name,
          category: newItem.category,
          stock: stockNum,
          unit: newItem.unit,
          status: newStatus
        })
      });

      if (res.ok) {
        setInventory([...inventory, await res.json()]);
        setIsAddModalOpen(false);
        setNewItem({ name: '', category: 'Fabric', stock: '', unit: 'Rolls' });
        
        await showAlert("Success", `${newItem.name} has been added to the inventory.`);
      } else {
        await showAlert("Error", "Failed to add item to database.");
      }
    } catch (error) { 
      await showAlert("Network Error", "Cannot connect to server.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || confirmKeyword !== 'admin') return;

    const newStockNum = Number(editStock);
    const newStatus = newStockNum <= 5 ? 'Critical' : newStockNum < 15 ? 'Low' : 'Good';

    setInventory(inventory.map(item => 
      item.id === selectedItem.id ? { ...item, stock: newStockNum, status: newStatus } : item
    ));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inventory/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStockNum, status: newStatus })
      });
      
      if (res.ok) {
        setIsEditModalOpen(false);
        
        if (newStatus === 'Critical') {
           await showAlert("Warning: Critical Level", `${selectedItem.name} stock has been updated but is now at a critical level (${newStockNum}). Please reorder soon.`);
        } else {
           await showAlert("Updated", `${selectedItem.name} stock has been updated to ${newStockNum}.`);
        }

        setSelectedItem(null);
        setConfirmKeyword('');
        setEditStock('');
      } else {
        fetchInventory(); 
        await showAlert("Error", "Failed to update item on the database.");
      }
    } catch (error) {
      fetchInventory(); 
      await showAlert("Network Error", "Cannot connect to server.");
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditStock(item.stock.toString());
    setConfirmKeyword('');
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Warehouse Inventory</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Monitor and secure raw materials.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 md:py-2 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={16} className="md:w-[18px] md:h-[18px]" /> Add Item
        </button>
      </div>

      {/* RESPONSIVE TABLE CARD */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-zinc-800 rounded-xl md:rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#09090b] border-b border-gray-100 dark:border-zinc-800 text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                <th className="p-4 md:p-5 font-bold">SKU</th>
                <th className="p-4 md:p-5 font-bold">Material Name</th>
                <th className="p-4 md:p-5 font-bold">Category</th>
                <th className="p-4 md:p-5 font-bold">Stock Count</th>
                <th className="p-4 md:p-5 font-bold">Status</th>
                <th className="p-4 md:p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {inventory.length === 0 ? (
                <tr><td colSpan={6} className="p-8 md:p-10 text-center text-gray-400 dark:text-zinc-600 font-medium">No items found in database.</td></tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors ${item.status === 'Critical' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                    <td className="p-4 md:p-5 font-mono text-gray-500 dark:text-zinc-400 font-medium">{item.sku}</td>
                    <td className="p-4 md:p-5 font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[200px]">{item.name}</td>
                    <td className="p-4 md:p-5">
                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 md:p-5 font-mono font-bold text-gray-700 dark:text-zinc-200">
                      <span className={item.status === 'Critical' ? 'text-red-600 dark:text-red-400' : ''}>{item.stock}</span> 
                      <span className="text-[10px] md:text-xs font-normal text-gray-400 dark:text-zinc-500 ml-1">{item.unit}</span>
                    </td>
                    <td className="p-4 md:p-5">
                      {item.status === 'Good' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] md:text-xs flex items-center gap-1"><CheckCircle size={14} className="md:w-4 md:h-4"/> In Stock</span>
                      ) : item.status === 'Low' ? (
                        <span className="text-amber-600 dark:text-amber-500 font-bold text-[10px] md:text-xs flex items-center gap-1"><AlertTriangle size={14} className="md:w-4 md:h-4"/> Low Stock</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-500 font-black text-[10px] md:text-xs flex items-center gap-1"><AlertTriangle size={14} className="md:w-4 md:h-4"/> Critical</span>
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="text-gray-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 p-2 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-zinc-800 active:scale-95"
                        >
                          <Pencil size={16} className="md:w-5 md:h-5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD ITEM MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b] shrink-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Add New Material</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors bg-gray-200 dark:bg-zinc-800 p-1.5 rounded-full"><X size={18} className="md:w-5 md:h-5"/></button>
            </div>
            
            <div className="overflow-y-auto p-4 md:p-6 custom-scrollbar">
              <form onSubmit={handleAddItem} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Material Name</label>
                  <input type="text" required value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Linen Fabric (White)" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Category</label>
                    <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors">
                      <option>Fabric</option><option>Thread</option><option>Hardware</option><option>Packaging</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Unit</label>
                    <select value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors">
                      <option>Rolls</option><option>Cones</option><option>Yards</option><option>Pcs</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">Initial Stock</label>
                  <input type="number" required min="0" value={newItem.stock} onChange={(e) => setNewItem({...newItem, stock: e.target.value})} className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors" placeholder="0" />
                </div>
                
                <div className="pt-3 md:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 border-t border-gray-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-bold rounded-xl transition-all shadow-md flex justify-center items-center">Save Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECURE EDIT MODAL ================= */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden zoom-in-95 animate-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b] shrink-0">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Update Stock</h3>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mt-0.5 md:mt-1 truncate max-w-[200px] md:max-w-[250px]">{selectedItem.name}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors bg-gray-200 dark:bg-zinc-800 p-1.5 rounded-full"><X size={18} className="md:w-5 md:h-5"/></button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 custom-scrollbar">
              <form onSubmit={handleEditSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 md:mb-2">New Stock Count ({selectedItem.unit})</label>
                  <input 
                    type="number" required min="0" 
                    value={editStock} 
                    onChange={(e) => setEditStock(e.target.value)} 
                    className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-zinc-800 rounded-xl px-3 md:px-4 py-3 md:py-4 text-lg md:text-xl font-black text-gray-900 dark:text-white outline-none focus:border-blue-500 text-center shadow-inner transition-colors" 
                  />
                </div>

                {/* STRICT SECURITY LOCK */}
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 md:p-4 rounded-xl border border-amber-200 dark:border-amber-900/30">
                   <label className="block text-[9px] md:text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><AlertTriangle size={12}/> Security Verification</label>
                   <p className="text-[10px] md:text-[11px] text-amber-700 dark:text-amber-400/80 mb-2 md:mb-3 leading-relaxed">Type <strong>admin</strong> to authorize stock change. This action is recorded.</p>
                   <input 
                     type="text" required
                     value={confirmKeyword}
                     onChange={(e) => setConfirmKeyword(e.target.value)}
                     className="w-full bg-white dark:bg-[#050505] border border-amber-200 dark:border-amber-900/50 rounded-lg px-3 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500 transition-colors"
                     placeholder="admin"
                   />
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={confirmKeyword !== 'admin'}
                    className={`w-full sm:w-auto px-5 py-2.5 md:py-3 text-xs md:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95 ${
                      confirmKeyword === 'admin' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-200 dark:bg-blue-900/30 text-blue-400 dark:text-blue-700 cursor-not-allowed'
                    }`}
                  >
                    Confirm Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;