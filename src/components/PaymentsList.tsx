import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface PaymentsListProps {
  saleId: Id<"sales">;
  onClose: () => void;
}

export function PaymentsList({ saleId, onClose }: PaymentsListProps) {
  const payments = useQuery(api.sales.getPayments, { saleId });
  const deletePayment = useMutation(api.sales.deletePayment);

  const handleDelete = async (paymentId: Id<"payments">) => {
    if (window.confirm("Tem certeza que deseja apagar este pagamento? Esta ação não pode ser desfeita.")) {
        try {
            await deletePayment({ paymentId });
            toast.success("Pagamento apagado com sucesso!");
        } catch (error) {
            toast.error("Erro ao apagar pagamento.");
        }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Histórico de Pagamentos</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-4">
        {payments === undefined && <p>Carregando...</p>}
        {payments && payments.length === 0 && <p className="text-gray-500">Nenhum pagamento registrado para esta venda.</p>}
        {payments?.map((payment) => (
          <div key={payment._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="font-medium">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString('pt-BR')} - {payment.paymentMethod}</p>
            </div>
            <button onClick={() => handleDelete(payment._id)} className="text-xs bg-red-100 text-red-700 rounded px-2 py-1 hover:bg-red-200">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
