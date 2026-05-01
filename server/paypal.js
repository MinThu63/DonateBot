function getConfig() {
  return {
    api: process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com",
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  };
}

export async function getAccessToken() {
  const { api, clientId, clientSecret } = getConfig();

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal client credentials");
  }

  const response = await fetch(`${api}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createOrder(amount, charity, currency = "SGD") {
  const { api } = getConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(`${api}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: parseFloat(amount).toFixed(2),
          },
          description: `Donation to ${charity}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal order create failed: ${text}`);
  }

  return response.json();
}

export async function captureOrder(orderId) {
  const { api } = getConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${api}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return response.json();
}

export async function refundCapture(captureId, amount, currency = "SGD") {
  if (!captureId) throw new Error("Missing PayPal capture id.");

  const { api } = getConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${api}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: {
          currency_code: currency,
          value: Number(amount).toFixed(2),
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal refund failed: ${text}`);
  }

  return response.json();
}
