import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Arquivo corrigido para aceitar os novos campos DNP e C.O. na criação e atualização de clientes.

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
      dnp: v.optional(v.string()),
      co: v.optional(v.string()),
    }),
    leftEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
      dnp: v.optional(v.string()),
      co: v.optional(v.string()),
    }),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clients", args);
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
      dnp: v.optional(v.string()),
      co: v.optional(v.string()),
    }),
    leftEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
      dnp: v.optional(v.string()),
      co: v.optional(v.string()),
    }),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (args.query.length === 0) {
      return [];
    }
    const clients = await ctx.db.query("clients").collect();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(args.query.toLowerCase()) ||
        client.phone.includes(args.query) ||
        (client.email && client.email.toLowerCase().includes(args.query.toLowerCase()))
    );
  },
});
