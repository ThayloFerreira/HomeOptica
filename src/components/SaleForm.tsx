import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface SaleFormProps {
  onClose: () => void;
}

interface SaleItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function SaleForm({ onClose }: SaleFormProps) {
  const clients = useQuery(api.clients.list);
  const nextSoNumber = useQuery(api.sales.getNextServiceOrderNumber);
  const createSale = useMutation(api.sales.create);

  const [serviceOrderNumber, setServiceOrderNumber] = useState<number | string>("");
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | "">("");
  const [items, setItems] = useState<SaleItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [frameValue, setFrameValue] = useState(0);
  const [lensValue, setLensValue] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [installments, setInstallments] = useState(1);
  const [paidAmount, setPaidAmount] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (nextSoNumber !== undefined) {
      setServiceOrderNumber(nextSoNumber);
    }
  }, [nextSoNumber]);

  const selectedClient = clients?.find(client => client._id === selectedClientId);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0) + frameValue + lensValue;
  const total = subtotal - discount;
  const pendingAmount = total - paidAmount;

  // Funções de item e prescrição omitidas para brevidade
  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    (newItems[index] as any)[field] = field === 'description' ? value : numValue;
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId) {
      toast.error("Selecione um cliente");
      return;
    }
    const finalSoNumber = Number(serviceOrderNumber);
    if (isNaN(finalSoNumber) || finalSoNumber <= 0) {
      toast.error("Número da O.S. inválido.");
      return;
    }

    // ...outras validações...

    try {
      const status = paidAmount >= total ? "paid" : paidAmount > 0 ? "partial" : "pending";

      await createSale({
        serviceOrderNumber: finalSoNumber,
        clientId: selectedClientId,
        clientName: selectedClient!.name,
        items: items.map(item => ({ ...item, description: item.description.trim() })),
        frameValue: frameValue > 0 ? frameValue : undefined,
        lensValue: lensValue > 0 ? lensValue : undefined,
        subtotal,
        discount: discount > 0 ? discount : undefined,
        total,
        paymentMethod,
        installments: paymentMethod === "installment" ? installments : undefined,
        paidAmount,
        pendingAmount,
        status,
        deliveryDate: deliveryDate || undefined,
        notes: notes.trim() || undefined,
      });
      
      toast.success("Venda registrada com sucesso!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar venda. Verifique se o número da O.S. já não foi utilizado.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nova Venda</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ordem de Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nº O.S. *</label>
            <input
              type="number"
              required
              value={serviceOrderNumber}
              onChange={(e) => setServiceOrderNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-yellow-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Seleção do cliente */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select
              required
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value as Id<"clients"> | "")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um cliente</option>
              {clients?.map((client) => (
                <option key={client._id} value={client._id}>{client.name} - {client.phone}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ... restante do formulário omitido para brevidade ... */}
        
        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Registrar Venda</button>
          <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
