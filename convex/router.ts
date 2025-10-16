import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/sales/:saleId/receipt-data",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const saleId = url.pathname.split('/')[3];
    
    try {
      const receiptData = await ctx.runQuery(api.sales.getSaleForReceipt, {
        saleId: saleId as any,
      });
      
      return new Response(JSON.stringify(receiptData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Dados não encontrados" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

export default http;
