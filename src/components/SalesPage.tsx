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
    return sales;
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

    const receiptContent = `<html>...</html>`; // Simplified for brevity
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Nova Venda</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
        <input 
          type="text"
          placeholder="Buscar por cliente ou Nº O.S..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="p-6 border-b">
            <p>O.S. #{sale.serviceOrderNumber} - {sale.clientName}</p>
            <button onClick={() => handleDeleteSale(sale._id)} className="text-red-500">Delete</button>
            <button onClick={() => printReceipt(sale)}>Imprimir</button>
          </div>
        ))}
      </div>

      {showForm && <div className="fixed inset-0"><SaleForm onClose={() => setShowForm(false)} /></div>}
      {showPaymentForm && selectedSaleId && <div className="fixed inset-0"><PaymentForm saleId={selectedSaleId} onClose={() => setShowPaymentForm(false)} /></div>}
    </div>
  );
}
