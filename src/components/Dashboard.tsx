import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Arquivo restaurado para a versão completa e funcional para corrigir crash.

export function Dashboard() {
  const salesStats = useQuery(api.sales.getTotalSales);
  const clients = useQuery(api.clients.list);
  const recentSales = useQuery(api.sales.list);

  // Guarda de segurança para evitar crash enquanto os dados carregam
  if (salesStats === undefined || clients === undefined || recentSales === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const recentSalesLimited = recentSales
    .filter(sale => sale.status !== 'cancelled')
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 5);

  const translateStatus = (status: string) => {
    const statuses: { [key: string]: string } = { paid: 'Pago', pending: 'Pendente', partial: 'Parcial', cancelled: 'Cancelado' };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
            <p className="text-2xl font-bold text-gray-900">{salesStats.totalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
            <p className="text-2xl font-bold text-gray-900">R$ {salesStats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-600">Total Pendente</p>
            <p className="text-2xl font-bold text-red-600">R$ {salesStats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Vendas Recentes</h2>
        </div>
        <div className="p-6">
          {recentSalesLimited.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma venda registrada ainda</p>
          ) : (
            <div className="space-y-4">
              {recentSalesLimited.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">O.S. #{sale.serviceOrderNumber} - {sale.clientName}</p>
                    <p className="text-sm text-gray-600">{new Date(sale._creationTime).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>{translateStatus(sale.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
