import { useState } from "react";
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
  const profile = useQuery(api.userProfiles.get);
  const createSale = useMutation(api.sales.create);

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
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalcular total do item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const formatPrescription = (client: any) => {
    if (!client) return "";
    
    const formatEye = (eye: any, label: string) => {
      const parts = [];
      if (eye.spherical) parts.push(`ESF: ${eye.spherical}`);
      if (eye.cylindrical) parts.push(`CIL: ${eye.cylindrical}`);
      if (eye.axis) parts.push(`EIXO: ${eye.axis}`);
      if (eye.addition) parts.push(`ADD: ${eye.addition}`);
      
      return parts.length > 0 ? `${label}: ${parts.join(', ')}` : "";
    };

    const rightEye = formatEye(client.rightEye, "OD");
    const leftEye = formatEye(client.leftEye, "OE");
    const pd = client.pupillaryDistance ? `DP: ${client.pupillaryDistance}mm` : "";
    
    const prescription = [rightEye, leftEye, pd].filter(Boolean).join(' | ');
    return prescription || "Sem prescrição registrada";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId) {
      toast.error("Selecione um cliente");
      return;
    }

    if (!selectedClient) {
      toast.error("Cliente não encontrado");
      return;
    }

    if (items.some(item => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error("Preencha todos os itens corretamente");
      return;
    }

    if (total <= 0) {
      toast.error("O total da venda deve ser maior que zero");
      return;
    }

    if (paidAmount < 0 || paidAmount > total) {
      toast.error("Valor pago deve estar entre 0 e o total da venda");
      return;
    }

    try {
      const status = paidAmount >= total ? "paid" : paidAmount > 0 ? "partial" : "pending";

      await createSale({
        clientId: selectedClientId,
        clientName: selectedClient.name,
        items: items.map(item => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
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
      toast.error("Erro ao registrar venda");
    }
  };

  const printReceipt = () => {
    if (!selectedClient) return;

    const receiptContent = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">${profile?.fantasyName || 'ÓTICA'}</h2>
          ${profile?.cnpj ? `<p style="margin: 2px 0; font-size: 12px;">CNPJ: ${profile.cnpj}</p>` : '<p style="margin: 2px 0; font-size: 12px;">CNPJ: 00.000.000/0000-00</p>'}
          ${profile?.contactPhone ? `<p style="margin: 2px 0; font-size: 12px;">Tel: ${profile.contactPhone}</p>` : '<p style="margin: 2px 0; font-size: 12px;">Tel: (00) 00000-0000</p>'}
          <hr style="margin: 10px 0;">
          <h3 style="margin: 5px 0;">RECIBO DE VENDA</h3>
        </div>
        
        <div style="margin-bottom: 15px; font-size: 12px;">
          <strong>Cliente:</strong> ${selectedClient.name}<br>
          <strong>Telefone:</strong> ${selectedClient.phone}<br>
          ${selectedClient.cpf ? `<strong>CPF:</strong> ${selectedClient.cpf}<br>` : ''}
          <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}
          ${deliveryDate ? `<br><strong>Entrega Prevista:</strong> ${new Date(deliveryDate).toLocaleDateString('pt-BR')}` : ''}
        </div>
        
        <div style="margin-bottom: 15px; font-size: 11px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
          <strong>PRESCRIÇÃO:</strong><br>
          ${formatPrescription(selectedClient)}
        </div>
        
        <hr style="margin: 15px 0;">
        
        <div style="margin-bottom: 15px; font-size: 12px;">
          <strong>ITENS:</strong><br>
          ${items.map(item => `
            ${item.description} - Qtd: ${item.quantity} - Valor: R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          `).join('<br>')}
          ${frameValue > 0 ? `<br>Armação: R$ ${frameValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
          ${lensValue > 0 ? `<br>Lentes: R$ ${lensValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
        </div>
        
        <hr style="margin: 15px 0;">
        
        <div style="margin-bottom: 15px; font-size: 12px;">
          <strong>Subtotal:</strong> R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
          ${discount > 0 ? `<strong>Desconto:</strong> R$ ${discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>` : ''}
          <strong>TOTAL:</strong> R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
          <strong>Valor Pago:</strong> R$ ${paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
          ${pendingAmount > 0 ? `<strong>Valor Pendente:</strong> R$ ${pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
        </div>
        
        <div style="margin-bottom: 15px; font-size: 12px;">
          <strong>Forma de Pagamento:</strong> ${
            paymentMethod === "cash" ? "Dinheiro" :
            paymentMethod === "card" ? "Cartão" :
            paymentMethod === "pix" ? "PIX" :
            paymentMethod === "installment" ? `Parcelado (${installments}x)` : paymentMethod
          }
        </div>
        
        ${notes ? `<div style="margin-bottom: 15px; font-size: 11px;"><strong>Observações:</strong> ${notes}</div>` : ''}
        
        <hr style="margin: 15px 0;">
        
        <div style="text-align: center; font-size: 10px; line-height: 1.4;">
          <p style="margin: 5px 0;">Obrigado pela preferência!</p>
          <p style="margin: 5px 0; font-style: italic;">
            "A garantia dos óculos é de 90 dias para defeitos de fabricação."
          </p>
          <p style="margin: 5px 0; font-style: italic; font-weight: bold;">
            "Informamos que, por se tratar de um produto personalizado e sob encomenda, o pedido de lentes não pode ser cancelado após a sua produção. O valor pago destina-se a cobrir os custos de fabricação."
          </p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo de Venda</title>
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (clients === undefined) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nova Venda</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção do cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value as Id<"clients"> | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name} - {client.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Data de entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Prevista para Entrega
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Valores de Armação e Lentes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores Específicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Armação
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={frameValue}
                onChange={(e) => setFrameValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor das Lentes
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={lensValue}
                onChange={(e) => setLensValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Itens da venda */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outros Itens</h3>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Adicionar Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Estojo, Flanela..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Unitário
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totais e desconto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtotal
              </label>
              <input
                type="text"
                readOnly
                value={`R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={subtotal}
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Final
              </label>
              <input
                type="text"
                readOnly
                value={`R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-100 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Forma de pagamento */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="pix">PIX</option>
                <option value="installment">Parcelado</option>
              </select>
            </div>
            
            {paymentMethod === "installment" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Parcelas
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {installments}x de R$ {(total / installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Valores pagos e pendentes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Controle de Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Pago
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={total}
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Pendente
              </label>
              <input
                type="text"
                readOnly
                value={`R$ ${pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  pendingAmount > 0 ? 'bg-yellow-100' : 'bg-green-100'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre a venda..."
          />
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Registrar Venda
          </button>
          <button
            type="button"
            onClick={printReceipt}
            disabled={!selectedClientId || total <= 0}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Imprimir Recibo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
