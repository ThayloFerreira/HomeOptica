import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function SalesPage() {
  const sales = useQuery(api.sales.list);
  const updateSale = useMutation(api.sales.update);
  const deleteSale = useMutation(api.sales.deleteSale);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<Id<"sales"> | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredSales = sales?.filter(sale => 
    filterStatus === "all" || sale.status === filterStatus
  ) || [];

  const handleStatusChange = async (saleId: Id<"sales">, newStatus: string) => {
    try {
      await updateSale({ id: saleId, status: newStatus });
      toast.success("Status da venda atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status da venda");
    }
  };
  
  const handleDelete = (saleId: Id<"sales">) => {
    if (window.confirm("Tem certeza que deseja apagar esta venda? Esta ação não pode ser desfeita.")) {
      deleteSale({ id: saleId })
        .then(() => toast.success("Venda apagada com sucesso!"))
        .catch(() => toast.error("Erro ao apagar venda."));
    }
  };

  const handleAddPayment = (saleId: Id<"sales">) => {
    setSelectedSaleId(saleId);
    setShowPaymentForm(true);
  };

  // A função de impressão permanece a mesma
  const printReceipt = async (sale: any) => { /* ...código da impressão omitido para brevidade... */ };

  if (sales === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie suas vendas e faturamento</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nova Venda
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        {/* ...código dos filtros omitido para brevidade... */}
      </div>

      {/* Lista de vendas */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              Nenhuma venda encontrada.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <div key={sale._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <span className="text-blue-600">O.S. #{sale.serviceOrderNumber}</span> - {sale.clientName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(sale._creationTime).toLocaleDateString('pt-BR')} às {new Date(sale._creationTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* ... restante do código da venda omitido para brevidade ... */}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                       {/* ... colunas de detalhes da venda omitidas ... */}
                      <div>
                        <select
                          value={sale.status}
                          onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 mb-2 w-full ${sale.status === 'paid' ? 'bg-green-100 text-green-800' : sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : sale.status === 'partial' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                          <option value="pending">Pendente</option>
                          <option value="partial">Parcial</option>
                          <option value="paid">Pago</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                        
                        <div className="flex flex-wrap gap-1">
                          {sale.pendingAmount > 0 && (
                            <button onClick={() => handleAddPayment(sale._id)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">+ Pagamento</button>
                          )}
                          <button onClick={() => printReceipt(sale)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">Imprimir</button>
                          <button onClick={() => handleDelete(sale._id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Apagar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SaleForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showPaymentForm && selectedSaleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <PaymentForm 
              saleId={selectedSaleId} 
              onClose={() => {
                setShowPaymentForm(false);
                setSelectedSaleId(null);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
