/**
 * Helper to safely serialize Firestore documents into plain JSON objects
 * for Next.js Server Components -> Client Components boundary.
 */
export function serializeFirestore<T>(data: any): T {
  if (!data) return data;
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value && typeof value === 'object') {
        if (typeof value.toDate === 'function') {
          return value.toDate().toISOString();
        }
        if ('_seconds' in value && '_nanoseconds' in value) {
          return new Date(value._seconds * 1000).toISOString();
        }
      }
      return value;
    })
  );
}
