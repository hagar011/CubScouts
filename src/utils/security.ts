/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const ALLOWED_LEADER_EMAILS = [
  'hagar01124@gmail.com',
  'elzohorscoutgroup@gmail.com',
];

/**
 * Checks if a given email is inside the approved leader email list.
 */
export const isLeaderEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_LEADER_EMAILS.includes(normalized);
};

/**
 * Firestore Sanitizer
 * ----------------------------------------------------
 * Recursively removes undefined values and functions
 * from objects and arrays before sending data to
 * Firestore.
 *
 * Benefits:
 * - Prevents Firestore serialization errors.
 * - Removes unsupported values automatically.
 * - Keeps nested objects and arrays safe.
 * - Preserves valid primitive values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const key of Object.keys(data as object)) {
      const value = (data as Record<string, unknown>)[key];
      if (value !== undefined && typeof value !== 'function') {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }

  return data;
}
