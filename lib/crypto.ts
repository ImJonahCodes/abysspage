/**
 * Creates an HMAC signature using Web Crypto API
 */
export async function createHmac(algorithm: string, key: string, message: string): Promise<string> {
  // Convert key and message to Uint8Array
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );

  // Sign the message
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}