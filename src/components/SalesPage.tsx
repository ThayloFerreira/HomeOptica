import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function SalesPage() {
  const sales = useQuery(api.sales.list);
  const updateSale = useMutation(api.sales.update);
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

  const handleAddPayment = (saleId: Id<"sales">) => {
    setSelectedSaleId(saleId);
    setShowPaymentForm(true);
  };

  const printReceipt = async (sale: any) => {
    try {
      // Buscar dados completos para o recibo
      const receiptData = await fetch(`/api/sales/${sale._id}/receipt-data`).then(res => res.json()).catch(() => null);
      
      // Se não conseguir buscar via API, usar dados básicos
      const formatPrescription = (client: any) => {
        if (!client) return "Dados não disponíveis";
        
        const formatEye = (eye: any, label: string) => {
          const parts = [];
          if (eye?.spherical) parts.push(`ESF: ${eye.spherical}`);
          if (eye?.cylindrical) parts.push(`CIL: ${eye.cylindrical}`);
          if (eye?.axis) parts.push(`EIXO: ${eye.axis}`);
          if (eye?.addition) parts.push(`ADD: ${eye.addition}`);
          
          return parts.length > 0 ? `${label}: ${parts.join(', ')}` : "";
        };

        const rightEye = formatEye(client.rightEye, "OD");
        const leftEye = formatEye(client.leftEye, "OE");
        const pd = client.pupillaryDistance ? `DP: ${client.pupillaryDistance}mm` : "";
        
        const prescription = [rightEye, leftEye, pd].filter(Boolean).join(' | ');
        return prescription || "Sem prescrição registrada";
      };
      
      const receiptContent = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">${receiptData?.profile?.fantasyName || 'ÓTICA'}</h2>
            ${receiptData?.profile?.cnpj ? `<p style="margin: 2px 0; font-size: 12px;">CNPJ: ${receiptData.profile.cnpj}</p>` : '<p style="margin: 2px 0; font-size: 12px;">CNPJ: 00.000.000/0000-00</p>'}
            ${receiptData?.profile?.contactPhone ? `<p style="margin: 2px 0; font-size: 12px;">Tel: ${receiptData.profile.contactPhone}</p>` : '<p style="margin: 2px 0; font-size: 12px;">Tel: (00) 00000-0000</p>'}
            <hr style="margin: 10px 0;">
            <h3 style="margin: 5px 0;">RECIBO DE VENDA</h3>
          </div>
          
          <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>Cliente:</strong> ${sale.clientName}<br>
            <strong>Data:</strong> ${new Date(sale._creationTime).toLocaleDateString('pt-BR')}
            ${sale.deliveryDate ? `<br><strong>Entrega Prevista:</strong> ${new Date(sale.deliveryDate).toLocaleDateString('pt-BR')}` : ''}
          </div>
          
          <div style="margin-bottom: 15px; font-size: 11px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
            <strong>PRESCRIÇÃO:</strong><br>
            ${receiptData?.client ? formatPrescription(receiptData.client) : 'Dados da prescrição não disponíveis'}
          </div>
          
          <hr style="margin: 15px 0;">
          
          <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>ITENS:</strong><br>
            ${sale.items.map((item: any) => `
              ${item.description} - Qtd: ${item.quantity} - Valor: R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            `).join('<br>')}
            ${sale.frameValue ? `<br>Armação: R$ ${sale.frameValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
            ${sale.lensValue ? `<br>Lentes: R$ ${sale.lensValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
          </div>
          
          <hr style="margin: 15px 0;">
          
          <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>Subtotal:</strong> R$ ${sale.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
            ${sale.discount ? `<strong>Desconto:</strong> R$ ${sale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>` : ''}
            <strong>TOTAL:</strong> R$ ${sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
            <strong>Valor Pago:</strong> R$ ${sale.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
            ${sale.pendingAmount > 0 ? `<strong>Valor Pendente:</strong> R$ ${sale.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
          </div>
          
          <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>Forma de Pagamento:</strong> ${
              sale.paymentMethod === "cash" ? "Dinheiro" :
              sale.paymentMethod === "card" ? "Cartão" :
              sale.paymentMethod === "pix" ? "PIX" :
              sale.paymentMethod === "installment" ? `Parcelado (${sale.installments}x)` : sale.paymentMethod
            }
          </div>
          
          ${sale.notes ? `<div style="margin-bottom: 15px; font-size: 11px;"><strong>Observações:</strong> ${sale.notes}</div>` : ''}
          
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
    } catch (error) {
      console.error('Erro ao imprimir recibo:', error);
      toast.error('Erro ao gerar recibo');
    }
  };

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "all"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilterStatus("partial")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "partial"
                ? "bg-orange-100 text-orange-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Parciais
          </button>
          <button
            onClick={() => setFilterStatus("paid")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "paid"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pagas
          </button>
          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* Lista de vendas */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {filterStatus === "all" ? "Nenhuma venda registrada ainda" : `Nenhuma venda ${filterStatus === "pending" ? "pendente" : filterStatus === "paid" ? "paga" : filterStatus === "partial" ? "parcial" : "cancelada"} encontrada`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <div key={sale._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{sale.clientName}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(sale._creationTime).toLocaleDateString('pt-BR')} às {new Date(sale._creationTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {sale.deliveryDate && (
                        <span className="text-sm text-blue-600 font-medium">
                          Entrega: {new Date(sale.deliveryDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <h4 className="font-medium text-gray-700">Itens:</h4>
                      {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{item.description} (x{item.quantity})</span>
                          <span className="font-medium">
                            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                      {sale.frameValue && (
                        <div className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded">
                          <span>Armação</span>
                          <span className="font-medium">
                            R$ {sale.frameValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      {sale.lensValue && (
                        <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded">
                          <span>Lentes</span>
                          <span className="font-medium">
                            R$ {sale.lensValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          Subtotal: R$ {sale.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {sale.discount && sale.discount > 0 && (
                          <p className="text-gray-600">
                            Desconto: R$ {sale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                        <p className="font-semibold text-gray-900">
                          Total: R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Pagamento: {
                          sale.paymentMethod === "cash" ? "Dinheiro" :
                          sale.paymentMethod === "card" ? "Cartão" :
                          sale.paymentMethod === "pix" ? "PIX" :
                          sale.paymentMethod === "installment" ? "Parcelado" : sale.paymentMethod
                        }</p>
                        {sale.installments && sale.installments > 1 && (
                          <p className="text-gray-600">{sale.installments}x de R$ {(sale.total / sale.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        )}
                        <p className="text-green-600 font-medium">
                          Pago: R$ {sale.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {sale.pendingAmount > 0 && (
                          <p className="text-red-600 font-medium">
                            Pendente: R$ {sale.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <select
                          value={sale.status}
                          onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 mb-2 ${
                            sale.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : sale.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : sale.status === 'partial'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="pending">Pendente</option>
                          <option value="partial">Parcial</option>
                          <option value="paid">Pago</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                        
                        <div className="flex gap-1">
                          {sale.pendingAmount > 0 && (
                            <button
                              onClick={() => handleAddPayment(sale._id)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              + Pagamento
                            </button>
                          )}
                          <button
                            onClick={() => printReceipt(sale)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Imprimir
                          </button>
                        </div>
                      </div>
                    </div>

                    {sale.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Obs: {sale.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal do formulário de venda */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SaleForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Modal do formulário de pagamento */}
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
