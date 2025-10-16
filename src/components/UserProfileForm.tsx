import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface UserProfileFormProps {
  onClose: () => void;
}

export function UserProfileForm({ onClose }: UserProfileFormProps) {
  const profile = useQuery(api.userProfiles.get);
  const updateProfile = useMutation(api.userProfiles.createOrUpdate);

  const [formData, setFormData] = useState({
    fantasyName: "",
    cnpj: "",
    contactPhone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fantasyName: profile.fantasyName || "",
        cnpj: profile.cnpj || "",
        contactPhone: profile.contactPhone || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        fantasyName: formData.fantasyName.trim() || undefined,
        cnpj: formData.cnpj.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
      });
      
      toast.success("Perfil atualizado com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Perfil da Empresa</h2>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Fantasia
          </label>
          <input
            type="text"
            value={formData.fantasyName}
            onChange={(e) => setFormData({ ...formData, fantasyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Ótica Visão Clara"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ
          </label>
          <input
            type="text"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone de Contato
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar Perfil
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
