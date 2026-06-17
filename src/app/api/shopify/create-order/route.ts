import { NextResponse } from 'next/server';
import { createShopifyOrder } from '@/lib/shopify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shop, accessToken, orderData, apiKey } = body;

    if (!shop || !accessToken || !orderData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createShopifyOrder(shop, accessToken, orderData, apiKey);

    if (result.success) {
      return NextResponse.json({ success: true, order: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
