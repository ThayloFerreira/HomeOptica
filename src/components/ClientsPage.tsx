import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClientForm } from "./ClientForm";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function ClientsPage() {
  const clients = useQuery(api.clients.list);
  const removeClient = useMutation(api.clients.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Id<"clients"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleDelete = async (id: Id<"clients">) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await removeClient({ id });
        toast.success("Cliente excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir cliente");
      }
    }
  };

  const handleEdit = (id: Id<"clients">) => {
    setEditingClient(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  if (clients === undefined) {
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e receitas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Novo Cliente
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <input
          type="text"
          placeholder="Pesquisar por nome, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <div key={client._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                      <span className="text-sm text-gray-500">
                        Cadastrado em {new Date(client._creationTime).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Telefone: {client.phone}</p>
                        {client.email && <p className="text-gray-600">Email: {client.email}</p>}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Olho Direito:</p>
                        <p className="text-gray-600">
                          ESF: {client.rightEye.spherical || "-"} | 
                          CIL: {client.rightEye.cylindrical || "-"} | 
                          EIXO: {client.rightEye.axis || "-"}
                        </p>
                        {client.rightEye.addition && (
                          <p className="text-gray-600">ADD: {client.rightEye.addition}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Olho Esquerdo:</p>
                        <p className="text-gray-600">
                          ESF: {client.leftEye.spherical || "-"} | 
                          CIL: {client.leftEye.cylindrical || "-"} | 
                          EIXO: {client.leftEye.axis || "-"}
                        </p>
                        {client.leftEye.addition && (
                          <p className="text-gray-600">ADD: {client.leftEye.addition}</p>
                        )}
                      </div>
                    </div>

                    {client.pupillaryDistance && (
                      <p className="text-sm text-gray-600 mt-2">
                        Distância Pupilar: {client.pupillaryDistance}mm
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client._id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ClientForm
              clientId={editingClient}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
