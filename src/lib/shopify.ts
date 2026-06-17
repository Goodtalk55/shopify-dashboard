import axios from 'axios';

export async function testShopifyConnection(shop: string, accessToken: string, apiKey?: string) {
  // Sanitize shop domain
  const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://${cleanShop}/admin/api/2024-01/shop.json`;
  
  const headers: any = {
    'Content-Type': 'application/json'
  };

  // If it looks like a modern token or no apiKey is provided, use the header
  if (accessToken.trim().startsWith('shpat_') || !apiKey) {
    headers['X-Shopify-Access-Token'] = accessToken.trim();
  } else {
    // Fallback to Basic Auth for Private Apps or shpss_ tokens
    const auth = Buffer.from(`${apiKey.trim()}:${accessToken.trim()}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }
  
  try {
    const response = await axios.get(url, { headers });
    return { success: true, data: response.data.shop };
  } catch (error: any) {
    // If we tried one way and failed, and we have both credentials, try the other way as a last resort
    if (error.response?.status === 401 && apiKey && headers['X-Shopify-Access-Token']) {
      try {
        const auth = Buffer.from(`${apiKey.trim()}:${accessToken.trim()}`).toString('base64');
        const retryResponse = await axios.get(url, { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          } 
        });
        return { success: true, data: retryResponse.data.shop };
      } catch (retryError) {
        // Fall through to original error
      }
    }

    const errorData = error.response?.data?.errors || error.message;
    return { 
      success: false, 
      error: typeof errorData === 'object' ? JSON.stringify(errorData) : errorData 
    };
  }
}

export async function createShopifyOrder(shop: string, accessToken: string, orderData: any, apiKey?: string) {
  // Sanitize shop domain
  const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://${cleanShop}/admin/api/2024-01/orders.json`;
  
  const headers: any = {
    'Content-Type': 'application/json'
  };

  if (accessToken.trim().startsWith('shpat_') || !apiKey) {
    headers['X-Shopify-Access-Token'] = accessToken.trim();
  } else {
    const auth = Buffer.from(`${apiKey.trim()}:${accessToken.trim()}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  const payload = {
    order: {
      email: orderData.email,
      line_items: [
        {
          title: orderData.product_name,
          price: orderData.product_price,
          quantity: parseInt(orderData.quantity || "1"),
        }
      ],
      customer: {
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        email: orderData.email
      },
      shipping_address: {
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        address1: orderData.address1,
        city: orderData.city,
        province: orderData.province,
        zip: orderData.zip,
        country: orderData.country,
        phone: orderData.phone
      },
      financial_status: "paid",
      send_receipt: true, 
      send_fulfillment_receipt: true
    }
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return { success: true, data: response.data.order };
  } catch (error: any) {
    const errorData = error.response?.data?.errors || error.message;
    return { 
      success: false, 
      error: typeof errorData === 'object' ? JSON.stringify(errorData) : errorData 
    };
  }
}

export async function fulfillOrder(shop: string, accessToken: string, orderId: number, apiKey?: string) {
  const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://${cleanShop}/admin/api/2024-01/orders/${orderId}/fulfillments.json`;
  
  const headers: any = {
    'Content-Type': 'application/json'
  };

  if (accessToken.trim().startsWith('shpat_') || !apiKey) {
    headers['X-Shopify-Access-Token'] = accessToken.trim();
  } else {
    const auth = Buffer.from(`${apiKey.trim()}:${accessToken.trim()}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  const payload = {
    fulfillment: {
      location_id: null,
      tracking_number: null,
      notify_customer: true
    }
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return { success: true, data: response.data.fulfillment };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}
