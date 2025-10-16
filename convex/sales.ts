import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Arquivo final corrigido com a função deletePayment.

// ... (funções list, search, get, getNextServiceOrderNumber, create, deleteSale, update continuam as mesmas)

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sales").collect();
  },
});

export const search = query({
  args: { searchText: v.string() },
  handler: async (ctx, args) => {
    if (args.searchText === "") {
      return ctx.db.query("sales").collect();
    }
    const searchNumber = parseInt(args.searchText);
    const results = await ctx.db.query("sales").collect();
    return results.filter(sale => {
      return sale.clientName.toLowerCase().includes(args.searchText.toLowerCase()) || (!isNaN(searchNumber) && sale.serviceOrderNumber === searchNumber);
    });
  },
});

export const get = query({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getNextServiceOrderNumber = query({
  args: {},
  handler: async (ctx) => {
    const lastSale = await ctx.db.query("sales").withIndex("by_serviceOrder").order("desc").first();
    return lastSale ? lastSale.serviceOrderNumber + 1 : 701;
  },
});

export const create = mutation({
  args: {
    serviceOrderNumber: v.number(),
    clientId: v.id("clients"),
    clientName: v.string(),
    items: v.array(v.object({ description: v.string(), quantity: v.number(), unitPrice: v.number(), total: v.number() })),
    subtotal: v.number(),
    discount: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.string(),
    installments: v.optional(v.number()),
    paidAmount: v.number(),
    pendingAmount: v.number(),
    status: v.string(),
    deliveryDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sales", args);
  },
});

export const deleteSale = mutation({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").withIndex("by_sale", q => q.eq("saleId", args.id)).collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }
    return await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("sales"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const addPayment = mutation({
    args: {
        saleId: v.id("sales"),
        amount: v.number(),
        paymentMethod: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const sale = await ctx.db.get(args.saleId);
        if (!sale) throw new Error("Venda não encontrada");
        await ctx.db.insert("payments", { saleId: args.saleId, amount: args.amount, paymentMethod: args.paymentMethod, paymentDate: Date.now(), notes: args.notes });
        const newPaidAmount = sale.paidAmount + args.amount;
        const newPendingAmount = sale.total - newPaidAmount;
        const newStatus = newPendingAmount <= 0 ? "paid" : "partial";
        await ctx.db.patch(args.saleId, { paidAmount: newPaidAmount, pendingAmount: newPendingAmount, status: newStatus });
        return { success: true };
    },
});

export const deletePayment = mutation({
    args: { paymentId: v.id("payments") },
    handler: async (ctx, args) => {
        const payment = await ctx.db.get(args.paymentId);
        if (!payment) {
            throw new Error("Pagamento não encontrado");
        }

        const sale = await ctx.db.get(payment.saleId);
        if (!sale) {
            throw new Error("Venda associada não encontrada");
        }

        // Subtrai o valor do pagamento e recalcula o saldo da venda
        const newPaidAmount = sale.paidAmount - payment.amount;
        const newPendingAmount = sale.total - newPaidAmount;
        const newStatus = newPendingAmount <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "pending";

        await ctx.db.patch(sale._id, {
            paidAmount: newPaidAmount,
            pendingAmount: newPendingAmount,
            status: newStatus,
        });

        // Deleta o pagamento
        await ctx.db.delete(args.paymentId);

        return { success: true };
    },
});


export const getSaleForReceipt = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("Venda não encontrada");
    const client = await ctx.db.get(sale.clientId);
    if (!client) throw new Error("Cliente não encontrado");
    const profile = await ctx.db.query("userProfiles").first();
    return { sale, client, profile };
  },
});

export const getTotalSales = query({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalCount = sales.length;
    const paidSales = sales.filter((sale) => sale.status === "paid");
    const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
    const totalPending = sales.reduce((sum, sale) => sum + (sale.pendingAmount || 0), 0);
    return { totalSales, totalCount, totalPaid, totalPending, paidCount: paidSales.length };
  },
});
