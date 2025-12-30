import { jwtDecode } from "jwt-decode";

/**
 * Checks if a given JWT token is expired.
 *
 * @param {string} token - The JWT token to check.
 * @return {boolean} - Returns `true` if the token is expired or invalid, otherwise `false`.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (decoded && typeof decoded.exp === "number") {
      const expirationTimestamp = decoded.exp * 1000; // Convert to milliseconds
      const currentTimestamp = Date.now();

      // Log the expiration and current timestamps
      // console.log("Expiration Timestamp:", new Date(expirationTimestamp).toLocaleString());
      // console.log("Current Timestamp:", new Date(currentTimestamp).toLocaleString());

      return currentTimestamp > expirationTimestamp;
    }
    return true;
  } catch (error) {
    // SECURITY: Don't log token decoding errors to prevent information disclosure
    // Silently return true (expired) on any error
    return true;
  }
}
