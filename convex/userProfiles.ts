import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// NOTE: All authentication checks have been removed for single-user mode.

export const get = query({
  args: {},
  handler: async (ctx) => {
    // Return the first profile found, as there's only one user now.
    const profile = await ctx.db.query("userProfiles").first();
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
    const existingProfile = await ctx.db.query("userProfiles").first();

    const profileData = {
      fantasyName: args.fantasyName?.trim() || undefined,
      cnpj: args.cnpj?.trim() || undefined,
      contactPhone: args.contactPhone?.trim() || undefined,
    };

    if (existingProfile) {
      return await ctx.db.patch(existingProfile._id, profileData);
    } else {
      // As there's no longer a 'userId', we remove it from the insert call.
      return await ctx.db.insert("userProfiles", profileData);
    }
  },
});
