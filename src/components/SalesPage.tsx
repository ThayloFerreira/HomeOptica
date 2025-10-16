import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { PaymentsList } from "./PaymentsList";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

// Arquivo final com o recibo atualizado.

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

    const logoUrl = `${window.location.origin}/logo.png`;

    const receiptContent = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; font-size: 12px;">
      <div style="text-align: center; margin-bottom: 10px;">
        <img src="${logoUrl}" alt="Logo" style="width: 180px; margin-bottom: 5px;"/>
        <p style="margin: 2px 0; font-size: 11px; font-style: italic;">A lente certa muda tudo</p>
        <p style="margin: 5px 0; font-size: 12px;">${profile?.cnpj ? `CNPJ: ${profile.cnpj}` : ''}</p>
        <p style="margin: 2px 0; font-size: 12px;">${profile?.contactPhone ? `Tel: ${profile.contactPhone}` : ''}</p>
      </div>
      <hr style="margin: 10px 0; border-top: 1px dashed #000;">
      <h3 style="text-align: center; margin: 10px 0;">ORDEM DE SERVIÇO #${sale.serviceOrderNumber}</h3>
      <hr style="margin: 10px 0; border-top: 1px dashed #000;">
      <div style="margin-bottom: 15px;">
        <strong>Cliente:</strong> ${sale.clientName}<br/>
        <strong>Data:</strong> ${new Date(sale._creationTime).toLocaleDateString('pt-BR')}<br/>
        ${sale.deliveryDate ? `<strong>Entrega Prevista:</strong> ${new Date(sale.deliveryDate).toLocaleDateString('pt-BR')}<br/>` : ''}
      </div>
      <div style="margin-bottom: 15px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
        <strong style="font-size: 11px;">PRESCRIÇÃO:</strong><br/>
        <span style="font-size: 11px;">${formatEye(client.rightEye, "OD")}</span><br/>
        <span style="font-size: 11px;">${formatEye(client.leftEye, "OE")}</span>
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
      <hr style="margin: 15px 0; border-top: 1px dashed #000;">
      <div style="font-size: 10px; text-align: center; font-style: italic;">
          <p>Prazo de adaptação com as novas lentes é de aproximadamente 15 dias. Durante esse período, podem ocorrer sintomas de tontura, dor de cabeça e náuseas.</p>
          <p>Este produto possui garantia legal contra defeitos de fabricação pelo período de 90 (noventa) dias corridos, contados a partir da data de recebimento do produto pelo consumidor, conforme o Código de Defesa do Consumidor (Lei Federal nº 8.078/90).</p>
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
      {/* ... (rest of the component) ... */}
    </div>
  );
}
