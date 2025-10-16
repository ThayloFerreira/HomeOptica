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
      dnp: "",
      co: "",
    },
    leftEye: {
      spherical: "",
      cylindrical: "",
      axis: "",
      addition: "",
      dnp: "",
      co: "",
    },
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
        rightEye: { ...formData.rightEye, ...client.rightEye },
        leftEye: { ...formData.leftEye, ...client.leftEye },
        notes: client.notes || "",
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEyeChange = (eye: 'rightEye' | 'leftEye', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value }
    }));
  };

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
          dnp: formData.rightEye.dnp.trim() || undefined,
          co: formData.rightEye.co.trim() || undefined,
        },
        leftEye: {
          spherical: formData.leftEye.spherical.trim() || undefined,
          cylindrical: formData.leftEye.cylindrical.trim() || undefined,
          axis: formData.leftEye.axis.trim() || undefined,
          addition: formData.leftEye.addition.trim() || undefined,
          dnp: formData.leftEye.dnp.trim() || undefined,
          co: formData.leftEye.co.trim() || undefined,
        },
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
    <div className="p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 z-10 border-b">
        <h2 className="text-xl font-bold text-gray-900">{clientId ? "Editar Cliente" : "Novo Cliente"}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
          {/* ... campos de dados pessoais ... */}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescrição Oftálmica</h3>
          
          <div className="mb-6 p-4 border rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">Olho Direito (OD)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Esférico" value={formData.rightEye.spherical} onChange={(e) => handleEyeChange('rightEye', 'spherical', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Cilíndrico" value={formData.rightEye.cylindrical} onChange={(e) => handleEyeChange('rightEye', 'cylindrical', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Eixo" value={formData.rightEye.axis} onChange={(e) => handleEyeChange('rightEye', 'axis', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Adição" value={formData.rightEye.addition} onChange={(e) => handleEyeChange('rightEye', 'addition', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="DNP" value={formData.rightEye.dnp} onChange={(e) => handleEyeChange('rightEye', 'dnp', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="C.O." value={formData.rightEye.co} onChange={(e) => handleEyeChange('rightEye', 'co', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="mb-6 p-4 border rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">Olho Esquerdo (OE)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Esférico" value={formData.leftEye.spherical} onChange={(e) => handleEyeChange('leftEye', 'spherical', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Cilíndrico" value={formData.leftEye.cylindrical} onChange={(e) => handleEyeChange('leftEye', 'cylindrical', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Eixo" value={formData.leftEye.axis} onChange={(e) => handleEyeChange('leftEye', 'axis', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="Adição" value={formData.leftEye.addition} onChange={(e) => handleEyeChange('leftEye', 'addition', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="DNP" value={formData.leftEye.dnp} onChange={(e) => handleEyeChange('leftEye', 'dnp', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="C.O." value={formData.leftEye.co} onChange={(e) => handleEyeChange('leftEye', 'co', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 z-10 border-t">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold">{clientId ? "Atualizar Cliente" : "Cadastrar Cliente"}</button>
          <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
