import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const createOrUpdate = mutation({
  args: {
    fantasyName: v.optional(v.string()),
    cnpj: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const profileData = {
      fantasyName: args.fantasyName?.trim() || undefined,
      cnpj: args.cnpj?.trim() || undefined,
      contactPhone: args.contactPhone?.trim() || undefined,
    };

    if (existingProfile) {
      return await ctx.db.patch(existingProfile._id, profileData);
    } else {
      return await ctx.db.insert("userProfiles", {
        userId,
        ...profileData,
      });
    }
  },
});
