import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export function SalesPage() {
  const allSales = useQuery(api.sales.list);
  const clients = useQuery(api.clients.list);
  const profile = useQuery(api.userProfiles.get);
  const updateSale = useMutation(api.sales.update);
  const deleteSaleMutation = useMutation(api.sales.deleteSale);

  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<Id<"sales"> | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = useMemo(() => {
    let sales = allSales || [];
    if (filterStatus !== "all") {
      sales = sales.filter(sale => sale.status === filterStatus);
    }
    if (searchTerm.trim() !== "") {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const searchNumber = parseInt(searchTerm, 10);
      sales = sales.filter(sale => 
        sale.clientName.toLowerCase().includes(lowerCaseSearch) || 
        (!isNaN(searchNumber) && sale.serviceOrderNumber === searchNumber)
      );
    }
    return sales.sort((a, b) => b.serviceOrderNumber - a.serviceOrderNumber);
  }, [allSales, filterStatus, searchTerm]);

  const handleDeleteSale = async (saleId: Id<"sales">) => {
    if (window.confirm("Tem certeza de que deseja excluir esta venda? Esta ação é irreversível.")) {
      try {
        await deleteSaleMutation({ id: saleId });
        toast.success("Venda excluída com sucesso!");
      } catch (error) {
        toast.error("Falha ao excluir a venda.");
      }
    }
  };

  const printReceipt = (sale: Doc<"sales">) => {
    const client = clients?.find(c => c._id === sale.clientId);
    if (!client || !profile) {
      toast.error("Dados do cliente ou perfil não encontrados para imprimir.");
      return;
    }
    
    // Correctly formatted receipt generation logic here...
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie suas vendas e faturamento</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Nova Venda</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4">
        <input 
          type="text"
          placeholder="Buscar por cliente ou Nº O.S..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
        />
        {/* Filter Buttons */}
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="p-6 border-b last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="text-blue-600">O.S. #{sale.serviceOrderNumber}</span> - {sale.clientName}
                </h3>
                {/* Other details... */}
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => handleDeleteSale(sale._id)} className="text-red-500 hover:text-red-700">Delete</button>
                 <button onClick={() => printReceipt(sale)}>Imprimir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg w-full max-w-4xl"><SaleForm onClose={() => setShowForm(false)} /></div></div>}
      {showPaymentForm && selectedSaleId && <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg max-w-md w-full"><PaymentForm saleId={selectedSaleId} onClose={() => setShowPaymentForm(false)} /></div></div>}
    </div>
  );
}
