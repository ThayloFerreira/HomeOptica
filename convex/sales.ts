import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// NOTE: All authentication checks have been removed for single-user mode.

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sales").order("desc").collect();
  },
});

export const search = query({
  args: { searchText: v.string() },
  handler: async (ctx, args) => {
    if (args.searchText === "") {
      return ctx.db.query("sales").order("desc").collect();
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
    // Add other fields you might want to update individually
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
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
