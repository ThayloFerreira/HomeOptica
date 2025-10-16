import { Toaster } from "sonner";
import { useState } from "react";
import { ClientsPage } from "./components/ClientsPage";
import { SalesPage } from "./components/SalesPage";
import { Dashboard } from "./components/Dashboard";
import { UserProfileForm } from "./components/UserProfileForm";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">Gestão Ótica</h2>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "clients" | "sales" | "profile">("dashboard");
  const [showProfileForm, setShowProfileForm] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage("clients")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === "clients"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setCurrentPage("sales")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === "sales"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Vendas
            </button>
            <button
              onClick={() => setShowProfileForm(true)}
              className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              Perfil da Empresa
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "clients" && <ClientsPage />}
        {currentPage === "sales" && <SalesPage />}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <UserProfileForm onClose={() => setShowProfileForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
