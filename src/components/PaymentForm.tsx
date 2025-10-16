import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface PaymentFormProps {
  saleId: Id<"sales">;
  onClose: () => void;
}

export function PaymentForm({ saleId, onClose }: PaymentFormProps) {
  const sale = useQuery(api.sales.get, { id: saleId });
  const addPayment = useMutation(api.sales.addPayment);

  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sale) {
      toast.error("Venda não encontrada");
      return;
    }

    if (amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    if (amount > sale.pendingAmount) {
      toast.error("Valor não pode ser maior que o valor pendente");
      return;
    }

    try {
      await addPayment({
        saleId,
        amount,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      
      toast.success("Pagamento registrado com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao registrar pagamento");
    }
  };

  if (!sale) {
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
        <h2 className="text-xl font-bold text-gray-900">Adicionar Pagamento</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Informações da Venda</h3>
        <p className="text-sm text-gray-600">Cliente: {sale.clientName}</p>
        <p className="text-sm text-gray-600">
          Total: R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-600">
          Já Pago: R$ {sale.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-sm font-semibold text-red-600">
          Pendente: R$ {sale.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor do Pagamento *
          </label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            max={sale.pendingAmount}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forma de Pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cash">Dinheiro</option>
            <option value="card">Cartão</option>
            <option value="pix">PIX</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre o pagamento..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Registrar Pagamento
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
