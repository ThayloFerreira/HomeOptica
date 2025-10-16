import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// NOTE: All authentication checks have been removed for single-user mode.

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sales").order("desc").collect();
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
    if (lastSale) {
      return lastSale.serviceOrderNumber + 1;
    }
    return 701; // Starting number
  },
});

export const create = mutation({
  args: {
    serviceOrderNumber: v.number(),
    clientId: v.id("clients"),
    clientName: v.string(),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      })
    ),
    frameValue: v.optional(v.number()),
    lensValue: v.optional(v.number()),
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
    // Before deleting the sale, delete all associated payments
    const payments = await ctx.db.query("payments").withIndex("by_sale", q => q.eq("saleId", args.id)).collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }
    // Now delete the sale itself
    return await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("sales"),
    status: v.optional(v.string()),
    paidAmount: v.optional(v.number()),
    pendingAmount: v.optional(v.number()),
    deliveryDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Allow updating service order number and other fields if needed in the future
    serviceOrderNumber: v.optional(v.number()), 
    clientName: v.optional(v.string()),
    total: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
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
    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    await ctx.db.insert("payments", {
      saleId: args.saleId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      paymentDate: Date.now(),
      notes: args.notes,
    });

    const newPaidAmount = sale.paidAmount + args.amount;
    const newPendingAmount = sale.total - newPaidAmount;
    const newStatus = newPendingAmount <= 0 ? "paid" : "partial";

    await ctx.db.patch(args.saleId, {
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      status: newStatus,
    });

    return { success: true };
  },
});

export const getByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sales")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

export const getTotalSales = query({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCount = sales.length;
    const paidSales = sales.filter((sale) => sale.status === "paid");
    const totalPaid = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
    const totalPending = sales.reduce(
      (sum, sale) => sum + sale.pendingAmount,
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

export const getPayments = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_sale", (q) => q.eq("saleId", args.saleId))
      .order("desc")
      .collect();
  },
});

export const getSaleWithClientAndProfile = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.saleId);
    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    const client = await ctx.db.get(sale.clientId);
    const profile = await ctx.db.query("userProfiles").first();

    return {
      sale,
      client,
      profile,
    };
  },
});

export const getSaleForReceipt = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.saleId);
    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    const client = await ctx.db.get(sale.clientId);
    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    const profile = await ctx.db.query("userProfiles").first();

    return {
      sale,
      client,
      profile,
    };
  },
});
