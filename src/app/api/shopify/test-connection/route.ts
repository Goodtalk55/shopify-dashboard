import { NextResponse } from 'next/server';
import { testShopifyConnection } from '@/lib/shopify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shop, accessToken, apiKey } = body;

    if (!shop || !accessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await testShopifyConnection(shop, accessToken, apiKey);

    if (result.success) {
      return NextResponse.json({ success: true, shop: result.data });
    } else {
      // Log the full error to terminal for debugging
      console.error("DEBUG - Shopify API Full Error:", result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
