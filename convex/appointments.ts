import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Arquivo corrigido com a sintaxe correta para as queries de data.

export const listByDay = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const startDate = new Date(args.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(args.date);
    endDate.setHours(23, 59, 59, 999);

    // Forma correta de fazer a query em um índice
    return await ctx.db
      .query("appointments")
      .withIndex("by_date", q => 
        q.gte("date", startDate.getTime()).lte("date", endDate.getTime())
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    clientName: v.string(),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Forma correta de verificar a existência de um agendamento
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_date", q => q.eq("date", args.date))
      .first();

    if (existingAppointment) {
      throw new Error("Este horário já está agendado.");
    }

    return await ctx.db.insert("appointments", args);
  },
});

export const cancel = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.appointmentId);
  },
});
