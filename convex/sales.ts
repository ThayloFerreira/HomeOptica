import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    return await ctx.db
      .query("sales")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const sale = await ctx.db.get(args.id);
    if (!sale || sale.userId !== userId) {
      throw new Error("Venda não encontrada");
    }

    return sale;
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    clientName: v.string(),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    return await ctx.db.insert("sales", {
      ...args,
      userId,
    });
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const sale = await ctx.db.get(args.id);
    if (!sale || sale.userId !== userId) {
      throw new Error("Venda não encontrada");
    }

    const { id, ...updateData } = args;
    return await ctx.db.patch(args.id, updateData);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.userId !== userId) {
      throw new Error("Venda não encontrada");
    }

    // Adicionar pagamento
    await ctx.db.insert("payments", {
      saleId: args.saleId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      paymentDate: Date.now(),
      notes: args.notes,
      userId,
    });

    // Atualizar valores da venda
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    return await ctx.db
      .query("sales")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

export const getTotalSales = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCount = sales.length;
    const paidSales = sales.filter(sale => sale.status === "paid");
    const totalPaid = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
    const totalPending = sales.reduce((sum, sale) => sum + sale.pendingAmount, 0);

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    return await ctx.db
      .query("payments")
      .withIndex("by_sale", (q) => q.eq("saleId", args.saleId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

export const getSaleWithClientAndProfile = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.userId !== userId) {
      throw new Error("Venda não encontrada");
    }

    const client = await ctx.db.get(sale.clientId);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.userId !== userId) {
      throw new Error("Venda não encontrada");
    }

    const client = await ctx.db.get(sale.clientId);
    if (!client) {
      throw new Error("Cliente não encontrado");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      sale,
      client,
      profile,
    };
  },
});
