import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shop, code, clientId, clientSecret } = body;

    if (!shop || !code || !clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const url = `https://${cleanShop}/admin/oauth/access_token`;

    const response = await axios.post(url, {
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      code
    });

    if (response.data.access_token) {
      return NextResponse.json({ 
        success: true, 
        accessToken: response.data.access_token,
        scope: response.data.scope
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to obtain access token" 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Token Exchange Error:", error.response?.data || error.message);
    return NextResponse.json({ 
      error: error.response?.data?.error_description || error.message 
    }, { status: 500 });
  }
}
