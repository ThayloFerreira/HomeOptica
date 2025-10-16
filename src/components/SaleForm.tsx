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
  const [installments, setInstallments] = useState(2);
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

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'description') {
      item.description = String(value);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        if (field === 'quantity') item.quantity = numValue;
        if (field === 'unitPrice') item.unitPrice = numValue;
      }
    }

    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
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
    <div className="p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 z-10 border-b">
        <h2 className="text-xl font-bold text-gray-900">Nova Venda</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nº O.S. *</label>
            <input type="number" required value={serviceOrderNumber} onChange={(e) => setServiceOrderNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-yellow-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value as Id<"clients"> | "")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Selecione um cliente</option>
              {clients?.map((client) => (<option key={client._id} value={client._id}>{client.name} - {client.phone}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Armação</label>
              <input type="number" min="0" step="0.01" value={frameValue} onChange={(e) => setFrameValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor das Lentes</label>
              <input type="number" min="0" step="0.01" value={lensValue} onChange={(e) => setLensValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outros Itens</h3>
            <button type="button" onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Adicionar Item</button>
          </div>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qtd</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unit.</label>
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input type="text" readOnly value={`R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>
                  {items.length > 1 && (<button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 hover:bg-red-100 rounded"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
              <input type="text" readOnly value={`R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
              <input type="number" min="0" step="0.01" max={subtotal} value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Final</label>
              <input type="text" readOnly value={`R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-100 font-semibold" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago</label>
              <input type="number" min="0" step="0.01" max={total} value={paidAmount} onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pendente</label>
              <input type="text" readOnly value={`R$ ${pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${pendingAmount > 0 ? 'bg-yellow-100' : 'bg-green-100'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="pix">PIX</option>
                <option value="installment">Parcelado</option>
              </select>
            </div>
            {paymentMethod === "installment" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                <input type="number" min="2" max="12" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value) || 2)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <p className="text-sm text-gray-600 mt-1">{installments}x de R$ {(total / installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 z-10 border-t">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold">Registrar Venda</button>
          <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
