import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state'); // In a real app, verify this state

  if (!code || !shop) {
    return NextResponse.json({ error: "Missing code or shop" }, { status: 400 });
  }

  // We need the clientId and clientSecret to exchange the code for a token
  // Since this is a client-side state app (Zustand + LocalStorage), 
  // we'll pass them in the 'state' or redirect back to a page that handles the final step.
  // However, for security, the exchange MUST happen on the server.
  
  // Strategy: Redirect back to the stores page with the code and shop, 
  // and let the frontend call a "confirm-token" API that has access to the secrets.
  
  const baseUrl = new URL(request.url).origin;
  return NextResponse.redirect(`${baseUrl}/stores?code=${code}&shop=${shop}&state=${state}`);
}
