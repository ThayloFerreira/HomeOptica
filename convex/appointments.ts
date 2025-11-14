import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Funções para gerenciar agendamentos.

// Lista os agendamentos para um dia específico
export const listByDay = query({
  args: { date: v.number() }, // data como timestamp
  handler: async (ctx, args) => {
    // Calcula o início e o fim do dia
    const startDate = new Date(args.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(args.date);
    endDate.setHours(23, 59, 59, 999);

    return await ctx.db
      .query("appointments")
      .withIndex("by_date")
      .filter(q => q.gte("date", startDate.getTime()) && q.lte("date", endDate.getTime()))
      .collect();
  },
});

// Cria um novo agendamento
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    clientName: v.string(),
    date: v.number(), // data e hora como timestamp
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verifica se o horário já está ocupado
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_date")
      .filter(q => q.eq("date", args.date))
      .first();

    if (existingAppointment) {
      throw new Error("Este horário já está agendado.");
    }

    return await ctx.db.insert("appointments", args);
  },
});

// Cancela (deleta) um agendamento
export const cancel = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.appointmentId);
  },
});
