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
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) {
      throw new Error("Cliente não encontrado");
    }

    return client;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    cpf: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    rightEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
    }),
    leftEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
    }),
    pupillaryDistance: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    return await ctx.db.insert("clients", {
      ...args,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    cpf: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    rightEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
    }),
    leftEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
    }),
    pupillaryDistance: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) {
      throw new Error("Cliente não encontrado");
    }

    const { id, ...updateData } = args;
    return await ctx.db.patch(args.id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) {
      throw new Error("Cliente não encontrado");
    }

    return await ctx.db.delete(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return clients.filter(client => 
      client.name.toLowerCase().includes(args.query.toLowerCase()) ||
      client.phone.includes(args.query) ||
      (client.email && client.email.toLowerCase().includes(args.query.toLowerCase()))
    );
  },
});
