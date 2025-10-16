import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { PaymentsList } from "./PaymentsList";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

// Arquivo restaurado com a função de impressão COMPLETA.

export function SalesPage() {
  const allSales = useQuery(api.sales.list);
  const clients = useQuery(api.clients.list);
  const profile = useQuery(api.userProfiles.get);
  const updateSale = useMutation(api.sales.update);
  const deleteSaleMutation = useMutation(api.sales.deleteSale);

  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentsList, setShowPaymentsList] = useState(false);
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
    return sales.sort((a, b) => b._creationTime - a._creationTime);
  }, [allSales, filterStatus, searchTerm]);

  const handleDeleteSale = async (saleId: Id<"sales">) => {
    if (window.confirm("Tem certeza que deseja apagar esta venda? Esta ação é irreversível e apagará todos os pagamentos associados.")) {
      try {
        await deleteSaleMutation({ id: saleId });
        toast.success("Venda excluída com sucesso!");
      } catch (error) {
        toast.error("Falha ao excluir a venda.");
      }
    }
  };
  
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

  const handleViewPayments = (saleId: Id<"sales">) => {
    setSelectedSaleId(saleId);
    setShowPaymentsList(true);
  };

  const printReceipt = (sale: Doc<"sales">) => {
    const client = clients?.find(c => c._id === sale.clientId);
    if (!client) {
      toast.error("Dados do cliente não carregados para impressão.");
      return;
    }

    const formatEye = (eye: any, label: string) => {
        const parts = [];
        if (eye?.spherical) parts.push(`ESF: ${eye.spherical}`);
        if (eye?.cylindrical) parts.push(`CIL: ${eye.cylindrical}`);
        if (eye?.axis) parts.push(`EIXO: ${eye.axis}`);
        if (eye?.addition) parts.push(`ADD: ${eye.addition}`);
        if (eye?.dnp) parts.push(`DNP: ${eye.dnp}`);
        if (eye?.co) parts.push(`C.O.: ${eye.co}`);
        return parts.length > 0 ? `${label}: ${parts.join(', ')}` : "";
      };

    const receiptContent = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; font-size: 12px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">${profile?.fantasyName || 'Sua Ótica'}</h2>
        <p style="margin: 2px 0; font-size: 12px;">${profile?.cnpj ? `CNPJ: ${profile.cnpj}` : ''}</p>
        <p style="margin: 2px 0; font-size: 12px;">${profile?.contactPhone ? `Tel: ${profile.contactPhone}` : ''}</p>
        <hr style="margin: 10px 0; border-top: 1px dashed #000;">
        <h3 style="margin: 5px 0;">ORDEM DE SERVIÇO #${sale.serviceOrderNumber}</h3>
      </div>
      <div style="margin-bottom: 15px;"><strong>Cliente:</strong> ${sale.clientName}<br/><strong>Data:</strong> ${new Date(sale._creationTime).toLocaleDateString('pt-BR')}</div>
      <div style="margin-bottom: 15px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
        <strong style="font-size: 11px;">PRESCRIÇÃO:</strong><br/>
        <span style="font-size: 11px;">${formatEye(client.rightEye, "OD")} | ${formatEye(client.leftEye, "OE")}</span>
      </div>
      <hr style="margin: 15px 0; border-top: 1px dashed #000;">
      <div style="margin-bottom: 15px;">
        <strong>ITENS:</strong><br/>
        ${sale.items.map((item: any) => `<span>- ${item.description} (Qtd: ${item.quantity}) - R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>`).join('<br/>')}
      </div>
      <hr style="margin: 15px 0; border-top: 1px dashed #000;">
      <div style="text-align: right; margin-bottom: 15px;">
        <strong>Subtotal:</strong> R$ ${sale.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
        ${sale.discount ? `<strong>Desconto:</strong> R$ ${sale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>` : ''}
        <strong>TOTAL:</strong> R$ ${sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
        <strong style="color: green;">Valor Pago:</strong> R$ ${sale.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
        ${sale.pendingAmount > 0 ? `<strong style="color: red;">Valor Pendente:</strong> R$ ${sale.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
      </div>
    </div>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Recibo O.S. #${sale.serviceOrderNumber}</title></head><body>${receiptContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (allSales === undefined) {
      return <div className="flex justify-center items-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Vendas</h1><p className="text-gray-600">Gerencie suas vendas e faturamento</p></div>
        <button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Nova Venda</button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4">
        <input type="text" placeholder="Buscar por cliente ou Nº O.S..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg"/>
      </div>
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="p-6 border-b last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900"><span className="text-blue-600">O.S. #{sale.serviceOrderNumber}</span> - {sale.clientName}</h3>
                <p className="text-sm text-gray-500">{new Date(sale._creationTime).toLocaleDateString('pt-BR')}</p>
                <div className="mt-2 text-sm">Total: <span className="font-bold">R$ {sale.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <select value={sale.status} onChange={(e) => handleStatusChange(sale._id, e.target.value)} className={`px-2 py-1 text-xs font-semibold rounded-full border-0`}>{/* Options here */}</select>
                 <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button onClick={() => handleViewPayments(sale._id)} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 hover:bg-gray-200">Ver Pagamentos</button>
                    <button onClick={() => handleAddPayment(sale._id)} className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200">+ Pagamento</button>
                    <button onClick={() => printReceipt(sale)} className="text-xs bg-green-100 text-green-700 rounded px-2 py-1 hover:bg-green-200">Imprimir</button>
                    <button onClick={() => handleDeleteSale(sale._id)} className="text-xs bg-red-100 text-red-700 rounded px-2 py-1 hover:bg-red-200">Apagar</button>
                 </div>
              </div>
            </div>
          </div>
        ))}
        {filteredSales.length === 0 && <div className="p-6 text-center text-gray-500">Nenhuma venda encontrada.</div>}
      </div>
      {showForm && <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg w-full max-w-4xl"><SaleForm onClose={() => setShowForm(false)} /></div></div>}
      {showPaymentForm && selectedSaleId && <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg max-w-md w-full"><PaymentForm saleId={selectedSaleId} onClose={() => setShowPaymentForm(false)} /></div></div>}
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
