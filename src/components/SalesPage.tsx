import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { PaymentsList } from "./PaymentsList"; // Import the new component
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export function SalesPage() {
  // ... (hooks and state definitions remain the same)
  const [showPaymentsList, setShowPaymentsList] = useState(false);

  // ... (filteredSales, handleDeleteSale, etc. remain the same)

  const handleViewPayments = (saleId: Id<"sales">) => {
    setSelectedSaleId(saleId);
    setShowPaymentsList(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Search/Filter bar */}
      
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="p-6 border-b last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold"><span className="text-blue-600">O.S. #{sale.serviceOrderNumber}</span> - {sale.clientName}</h3>
                {/* Other sale details */}
              </div>
              <div className="flex flex-col items-end gap-2">
                 {/* Status select */}
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleViewPayments(sale._id)} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 hover:bg-gray-200">Ver Pagamentos</button>
                    <button onClick={() => handleAddPayment(sale._id)} className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200">+ Pagamento</button>
                    <button onClick={() => printReceipt(sale)} className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 hover:bg-green-200">Imprimir</button>
                    <button onClick={() => handleDeleteSale(sale._id)} className="text-xs bg-red-100 text-red-700 rounded px-2 py-1 hover:bg-red-200">Apagar</button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showForm && (/* SaleForm Modal */)}
      {showPaymentForm && selectedSaleId && (/* PaymentForm Modal */)}
      {showPaymentsList && selectedSaleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <PaymentsList saleId={selectedSaleId} onClose={() => setShowPaymentsList(false)} />
            </div>
        </div>
      )}
    </div>
  );
}
