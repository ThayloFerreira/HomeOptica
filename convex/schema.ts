import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// NOTE: Authentication has been removed. The authTables and all userId fields have been made optional or removed.

const applicationTables = {
  userProfiles: defineTable({
    userId: v.optional(v.id("users")), // Made optional
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
      dnp: v.optional(v.string()), // DNP olho direito
      co: v.optional(v.string()),  // Altura (C.O.) olho direito
    }),
    leftEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
      dnp: v.optional(v.string()), // DNP olho esquerdo
      co: v.optional(v.string()),  // Altura (C.O.) olho esquerdo
    }),
    notes: v.optional(v.string()),
    userId: v.optional(v.id("users")), // Made optional
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"])
    .index("by_phone", ["phone"]),

  sales: defineTable({
    serviceOrderNumber: v.number(), // Ordem de Serviço
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
    userId: v.optional(v.id("users")), // Made optional
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
    userId: v.optional(v.id("users")), // Made optional
  })
    .index("by_sale", ["saleId"])
    .index("by_user", ["userId"]),
  
  users: defineTable({}),
};

export default defineSchema({
  ...applicationTables,
});
