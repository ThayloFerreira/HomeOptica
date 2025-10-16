import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface ClientFormProps {
  clientId?: Id<"clients"> | null;
  onClose: () => void;
}

export function ClientForm({ clientId, onClose }: ClientFormProps) {
  const client = useQuery(api.clients.get, clientId ? { id: clientId } : "skip");
  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    birthDate: "",
    rightEye: {
      spherical: "",
      cylindrical: "",
      axis: "",
      addition: "",
    },
    leftEye: {
      spherical: "",
      cylindrical: "",
      axis: "",
      addition: "",
    },
    pupillaryDistance: "",
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        phone: client.phone,
        cpf: client.cpf || "",
        address: client.address || "",
        birthDate: client.birthDate || "",
        rightEye: {
          spherical: client.rightEye.spherical || "",
          cylindrical: client.rightEye.cylindrical || "",
          axis: client.rightEye.axis || "",
          addition: client.rightEye.addition || "",
        },
        leftEye: {
          spherical: client.leftEye.spherical || "",
          cylindrical: client.leftEye.cylindrical || "",
          axis: client.leftEye.axis || "",
          addition: client.leftEye.addition || "",
        },
        pupillaryDistance: client.pupillaryDistance || "",
        notes: client.notes || "",
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    try {
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        cpf: formData.cpf.trim() || undefined,
        address: formData.address.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        rightEye: {
          spherical: formData.rightEye.spherical.trim() || undefined,
          cylindrical: formData.rightEye.cylindrical.trim() || undefined,
          axis: formData.rightEye.axis.trim() || undefined,
          addition: formData.rightEye.addition.trim() || undefined,
        },
        leftEye: {
          spherical: formData.leftEye.spherical.trim() || undefined,
          cylindrical: formData.leftEye.cylindrical.trim() || undefined,
          axis: formData.leftEye.axis.trim() || undefined,
          addition: formData.leftEye.addition.trim() || undefined,
        },
        pupillaryDistance: formData.pupillaryDistance.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (clientId) {
        await updateClient({ id: clientId, ...clientData });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createClient(clientData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {clientId ? "Editar Cliente" : "Novo Cliente"}
        </h2>
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
        {/* Dados pessoais */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Prescrição Oftálmica */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescrição Oftálmica</h3>
          
          {/* Olho Direito */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Olho Direito (OD)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Esférico
                </label>
                <input
                  type="text"
                  placeholder="Ex: -2.00"
                  value={formData.rightEye.spherical}
                  onChange={(e) => setFormData({
                    ...formData,
                    rightEye: { ...formData.rightEye, spherical: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cilíndrico
                </label>
                <input
                  type="text"
                  placeholder="Ex: -1.00"
                  value={formData.rightEye.cylindrical}
                  onChange={(e) => setFormData({
                    ...formData,
                    rightEye: { ...formData.rightEye, cylindrical: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eixo
                </label>
                <input
                  type="text"
                  placeholder="Ex: 90°"
                  value={formData.rightEye.axis}
                  onChange={(e) => setFormData({
                    ...formData,
                    rightEye: { ...formData.rightEye, axis: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adição
                </label>
                <input
                  type="text"
                  placeholder="Ex: +2.00"
                  value={formData.rightEye.addition}
                  onChange={(e) => setFormData({
                    ...formData,
                    rightEye: { ...formData.rightEye, addition: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Olho Esquerdo */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Olho Esquerdo (OE)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Esférico
                </label>
                <input
                  type="text"
                  placeholder="Ex: -2.00"
                  value={formData.leftEye.spherical}
                  onChange={(e) => setFormData({
                    ...formData,
                    leftEye: { ...formData.leftEye, spherical: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cilíndrico
                </label>
                <input
                  type="text"
                  placeholder="Ex: -1.00"
                  value={formData.leftEye.cylindrical}
                  onChange={(e) => setFormData({
                    ...formData,
                    leftEye: { ...formData.leftEye, cylindrical: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eixo
                </label>
                <input
                  type="text"
                  placeholder="Ex: 90°"
                  value={formData.leftEye.axis}
                  onChange={(e) => setFormData({
                    ...formData,
                    leftEye: { ...formData.leftEye, axis: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adição
                </label>
                <input
                  type="text"
                  placeholder="Ex: +2.00"
                  value={formData.leftEye.addition}
                  onChange={(e) => setFormData({
                    ...formData,
                    leftEye: { ...formData.leftEye, addition: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Distância Pupilar */}
          <div className="mb-6">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distância Pupilar (mm)
              </label>
              <input
                type="text"
                placeholder="Ex: 62"
                value={formData.pupillaryDistance}
                onChange={(e) => setFormData({ ...formData, pupillaryDistance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações adicionais sobre o cliente ou prescrição..."
          />
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {clientId ? "Atualizar Cliente" : "Cadastrar Cliente"}
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
