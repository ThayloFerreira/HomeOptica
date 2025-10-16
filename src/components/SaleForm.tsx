import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

// ... (interfaces remain the same)

export function SaleForm({ onClose }: { onClose: () => void }) {
  const clients = useQuery(api.clients.list);
  const nextSoNumber = useQuery(api.sales.getNextServiceOrderNumber);
  const createSale = useMutation(api.sales.create);

  const [serviceOrderNumber, setServiceOrderNumber] = useState<number | string>("");
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | "">("");
  const [items, setItems] = useState<any[]>([{ description: "", quantity: "", unitPrice: "", total: 0 }]);
  const [discount, setDiscount] = useState<number | string>("");
  const [paidAmount, setPaidAmount] = useState<number | string>("");
  // ... (other state variables)

  useEffect(() => {
    if (nextSoNumber !== undefined) {
      setServiceOrderNumber(nextSoNumber);
    }
  }, [nextSoNumber]);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - Number(discount);
  const pendingAmount = total - Number(paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simplified validation
    if (!selectedClientId) return toast.error("Cliente é obrigatório.");

    const saleItems = items
      .map(i => ({ 
        description: i.description, 
        quantity: Number(i.quantity), 
        unitPrice: Number(i.unitPrice), 
        total: Number(i.quantity) * Number(i.unitPrice)
      }))
      .filter(i => i.description && i.quantity > 0);

    if (saleItems.length === 0) return toast.error("Adicione pelo menos um item válido.");

    try {
      await createSale({
        serviceOrderNumber: Number(serviceOrderNumber),
        clientId: selectedClientId,
        clientName: clients?.find(c => c._id === selectedClientId)?.name ?? "",
        items: saleItems,
        subtotal,
        discount: Number(discount) || undefined,
        total,
        paymentMethod: "cash", // Simplified
        paidAmount: Number(paidAmount),
        pendingAmount,
        status: pendingAmount <= 0 ? "paid" : "pending",
        // ... (other fields)
      });
      toast.success("Venda registrada!");
      onClose();
    } catch (error) {
      toast.error("Falha ao registrar a venda.");
    }
  };

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Header */}
        
        {/* Client and S.O. Number Section */}

        {/* Items Section - This is where the main change is */}
        <div>
          <h3>Itens da Venda</h3>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-5 gap-2">
              <input 
                placeholder="Descrição" 
                value={item.description} 
                onChange={e => { /* update item logic */ }} 
                className="col-span-2" 
              />
              <input 
                placeholder="Qtd" 
                type="number" 
                value={item.quantity} 
                onChange={e => { /* update item logic */ }} 
              />
              <input 
                placeholder="Preço Unit." 
                type="number" 
                value={item.unitPrice} 
                onChange={e => { /* update item logic */ }} 
              />
              <span>{/* Total */}</span>
            </div>
          ))}
          <button type="button" onClick={() => setItems([...items, { description: "", quantity: "", unitPrice: "", total: 0 }])}>+ Item</button>
        </div>

        {/* Financial Section */}
        
        <button type="submit">Salvar Venda</button>
      </form>
    </div>
  );
}
