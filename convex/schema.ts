import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    fantasyName: v.optional(v.string()), // Nome fantasia
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
    // Grau do olho direito
    rightEye: v.object({
      spherical: v.optional(v.string()), // Grau esférico
      cylindrical: v.optional(v.string()), // Grau cilíndrico
      axis: v.optional(v.string()), // Eixo
      addition: v.optional(v.string()), // Adição (para multifocal)
    }),
    // Grau do olho esquerdo
    leftEye: v.object({
      spherical: v.optional(v.string()),
      cylindrical: v.optional(v.string()),
      axis: v.optional(v.string()),
      addition: v.optional(v.string()),
    }),
    // Distância pupilar
    pupillaryDistance: v.optional(v.string()),
    notes: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"])
    .index("by_phone", ["phone"]),

  sales: defineTable({
    clientId: v.id("clients"),
    clientName: v.string(),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    frameValue: v.optional(v.number()), // Valor da armação
    lensValue: v.optional(v.number()), // Valor das lentes
    subtotal: v.number(),
    discount: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.string(), // "cash", "card", "pix", "installment"
    installments: v.optional(v.number()),
    paidAmount: v.number(), // Valor pago
    pendingAmount: v.number(), // Valor pendente
    status: v.string(), // "pending", "paid", "cancelled", "partial"
    deliveryDate: v.optional(v.string()), // Data prevista para entrega
    notes: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    saleId: v.id("sales"),
    amount: v.number(),
    paymentMethod: v.string(),
    paymentDate: v.number(),
    notes: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("by_sale", ["saleId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
