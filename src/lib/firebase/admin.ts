import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for server-side operations
if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: "sarkarperfumes",
      clientEmail: "firebase-adminsdk-fbsvc@sarkarperfumes.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDfjzj2J9KQJtZD\nHFduPFlFPJcHvK7W6DupgNe14yQ6Vj8pgh0lroqp/fZuQjzvn2ddaLZft0pvf5R1\nG91KrHAcENVuu7yKtmWDM6/gfNJLf123soCRsTxC8itX5fEp78qsQRR2ig3OnInZ\n6/o2VJyw2pGqVUdMDWBJeoOx0ZJvaNrU76Z98Nnp+AH199jTGgHlTZJn/iZfeURM\n9SYHnuaoIJ8VRI4wAeR6PXNGx/BNhIksk4yzSo58XDfnfRFm8waP1XpkRw+dblkM\nc1HEe8YVMZGD+xeEIbFRT6v1LU1hBnVRsR9FXp+It6jhlehL9f1O1yrZy5k6yZKL\n4HneUCUFAgMBAAECggEABkZMujtJvDzcJdPkD/vsIoFt7hbpjlkZdute7Tk5QVTo\niWz1jfhH5o0HpLZsY5UFBO4P3lW0kQwS5IrkwLg1yP009wUYaIlFhfObrls6g3Qe\nndhfUOzZTOS4pYsr5A+ET/uJ9ujENJttUrs+PCukSTdylVthjfzQdMeA7kBRp0RL\n9XJgsxuHymvVQ93pxDik+KagFWtAP5CyJt8LRCEPKcdxrMMQRsztD5zS7f0jLEYc\nLExzzoJJAgI3xAjOuUzpSlhf+HrZ6+MF693hFR5SnttMr6fCQ3CeB2qNzMdSzXgB\nsf+lUrmX9Ed40zJVGndrIqzDdTdzBIaIz9Mc6PZhmQKBgQDxCB40wRUxIuZ1LWr1\n/58RWTG8n2rZ49ax6a+fe0l35YrdMI9RG0GcINSsUDN/8Ze/3oOrG3ZmJPqZnMEG\na+gsQYXZhbnh2oXj8H+e63FB7rX/R0osv+48SWR2wfsOy88AjXfpsexQqhYZKpa0\nhH5MGdbY+D1+wT0nIDJwcHDrWQKBgQDtcVVoZFKWJYQcbhvD1Fba40PTpLD9P6Wg\nbGgaWcSgkoIp0/89Qykrf/z+AnVVhbgXzOzmIhvsRRJX6mphji1vxFHVnQ9SGWO5\nJWWtlSwANgj0fS7VvyBKSb+XyDY8A4z0v5VPRYsmJN3VKaSpiYglowJ1ZYRf/vmR\nE0qQXyMNjQKBgANRP0kulyIT/uQB+gTkvcW5WovkDc5t6liMhNRHGB3EVQLyViah\nn2eMtCCjAfJy2snTQDCsshZ5z9EpbSaveYSSaksyIfrPzSPz/W2sg+SKaorW6lhv\nU9IUmINh7BiqCXFSgSIARuZdUOyLv4NAh5R4jpJx6DbEZhkRwl/1zDgRAoGAJnKX\nldPI268veTsLG+aiOcdbEEY2sos/0n47TSkEAcw3b3Z4ef8KB5Ut7iOPxE1mxdPU\n+F7FjriQg9PdbfaLvPFZHvHTrUOXNj+r+zOQcGhPgudSUiIkpGLUt0sgHQ+mH2t2\nTePA6GhH02Bu3VT7yrxehYvup2yuFKO/Cymcj3ECgYEAk+DBXoUA4cRAKAqx1tvC\nIkyvVZpICM19NQ4u6WkyZ2fG4qjqbR8Qb1G0nRN9JIBGIZv5pIoJ+BnaCr6glTWP\nym7MgGpOcyfN6za+46f3ODUI3jGab+PibVuGfk9C/NWj8aoKsYUBS/OwkDhiiL5M\npQvtKAqhsl67zmoBjfDG1s4=\n-----END PRIVATE KEY-----\n"
    };

    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export const adminDb = getFirestore();
