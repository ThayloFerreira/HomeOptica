import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Arquivo com a adição da nova tabela 'appointments'.

const applicationTables = {
  userProfiles: defineTable({
    userId: v.optional(v.id("users")), 
    fantasyName: v.optional(v.string()),
    cnpj: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  clients: defineTable({
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
    userId: v.optional(v.id("users")), 
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"])
    .index("by_phone", ["phone"]),

  sales: defineTable({
    serviceOrderNumber: v.number(),
    clientId: v.id("clients"),
    clientName: v.string(),
    items: v.array(v.object({ description: v.string(), quantity: v.number(), unitPrice: v.number(), total: v.number() })),
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
    userId: v.optional(v.id("users")), 
  })
    .index("by_serviceOrder", ["serviceOrderNumber"])
    .index("by_user", ["userId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    saleId: v.id("sales"),
    amount: v.number(),
    paymentMethod: v.string(),
    paymentDate: v.number(),
    notes: v.optional(v.string()),
    userId: v.optional(v.id("users")), 
  })
    .index("by_sale", ["saleId"])
    .index("by_user", ["userId"]),

  appointments: defineTable({
    clientId: v.id("clients"),
    clientName: v.string(),
    date: v.number(), // Armazenado como timestamp para queries de data/hora
    notes: v.optional(v.string()),
  }).index("by_date", ["date"]),
  
  users: defineTable({}),
};

export default defineSchema({
  ...applicationTables,
});
