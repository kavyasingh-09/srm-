// Utility functions for Web Crypto API (E2EE Chat)

/**
 * Derives a shared AES-GCM key using SHA-256 based on deterministic identifiers.
 * In a production E2EE system, you'd use ECDH to derive a shared secret from public/private keypairs.
 * For this implementation, we use a deterministic seed based on listingId, buyerId, and sellerId.
 * 
 * @param {string|number} listingId 
 * @param {string|number} userAId 
 * @param {string|number} userBId 
 * @returns {Promise<CryptoKey>}
 */
export async function deriveSharedKey(listingId, userAId, userBId) {
  // Sort user IDs so the seed is the same regardless of who is sender/receiver
  const sortedUsers = [userAId, userBId].sort((a, b) => Number(a) - Number(b));
  const seedString = `chat_secret_v1_${listingId}_${sortedUsers[0]}_${sortedUsers[1]}`;
  
  const encoder = new TextEncoder();
  const seedData = encoder.encode(seedString);
  
  // Hash the seed using SHA-256
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', seedData);
  
  // Import the hash as an AES-GCM key
  return window.crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext message using AES-GCM and generates a SHA-256 signature.
 * 
 * @param {string} plaintext 
 * @param {CryptoKey} key 
 * @returns {Promise<{encryptedMessage: string, iv: string, signature: string}>}
 */
export async function encryptMessage(plaintext, key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate a random Initialization Vector (IV) for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Generate SHA-256 signature of the plaintext for data integrity
  const signatureBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert buffers to base64 strings for transport
  const encryptedMessage = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  const ivString = btoa(String.fromCharCode(...iv));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  
  return { encryptedMessage, iv: ivString, signature };
}

/**
 * Decrypts an AES-GCM encrypted message.
 * 
 * @param {string} encryptedMessage Base64 encoded ciphertext
 * @param {string} ivString Base64 encoded IV
 * @param {CryptoKey} key 
 * @returns {Promise<string>} Plaintext message
 */
export async function decryptMessage(encryptedMessage, ivString, key) {
  try {
    const encryptedArray = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(ivString), c => c.charCodeAt(0));
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray },
      key,
      encryptedArray
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "[Message could not be decrypted]";
  }
}
