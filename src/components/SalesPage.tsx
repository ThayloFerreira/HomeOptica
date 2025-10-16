import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SaleForm } from "./SaleForm";
import { PaymentForm } from "./PaymentForm";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export function SalesPage() {
  const allSales = useQuery(api.sales.list);
  const clients = useQuery(api.clients.list);
  const profile = useQuery(api.userProfiles.get);
  const updateSale = useMutation(api.sales.update);
  const deleteSaleMutation = useMutation(api.sales.deleteSale);

  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
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
    return sales;
  }, [allSales, filterStatus, searchTerm]);

  const printReceipt = (sale: Doc<"sales">) => {
    const client = clients?.find(c => c._id === sale.clientId);
    // ... (rest of the printReceipt function as before, using client and profile from the hooks)
  };

  // ... other handlers

  return (
    <div className="space-y-6">
        {/* UI Elements */}
    </div>
  );
}
