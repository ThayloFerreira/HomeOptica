import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ... (other functions like list, search, get, etc. remain the same)

export const getTotalSales = query({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();

    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalCount = sales.length;
    const paidSales = sales.filter((sale) => sale.status === "paid");
    const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
    const totalPending = sales.reduce(
      (sum, sale) => sum + (sale.pendingAmount || 0),
      0
    );

    return {
      totalSales,
      totalCount,
      totalPaid,
      totalPending,
      paidCount: paidSales.length,
    };
  },
});

// ... (other functions like getSaleForReceipt, create, deleteSale etc. remain the same)
