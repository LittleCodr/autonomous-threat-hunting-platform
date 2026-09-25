import { SecurityEvent } from "@/types";
import { adminDb } from "../firebase/admin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Autonomous Hunt Engine
 * Automatically fetches related events within a time window based on the triggering event's telemetry.
 */
export async function huntRelatedEvents(triggerEvent: SecurityEvent): Promise<SecurityEvent[]> {
  const timeWindowMs = 15 * 60 * 1000; // 15 mins before and after
  const startTime = new Date(triggerEvent.timestamp.getTime() - timeWindowMs);
  const endTime = new Date(triggerEvent.timestamp.getTime() + timeWindowMs);

  const relatedEventsMap = new Map<string, SecurityEvent>();
  
  const addResults = (snapshot: FirebaseFirestore.QuerySnapshot) => {
    snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const eventTime = data.timestamp.toDate().getTime();
      
      // Memory filter to avoid composite indexes for demo
      if (eventTime >= startTime.getTime() && eventTime <= endTime.getTime()) {
        if (!relatedEventsMap.has(doc.id)) {
          relatedEventsMap.set(doc.id, {
            id: doc.id,
            ...data,
            timestamp: new Date(eventTime),
          } as SecurityEvent);
        }
      }
    });
  };

  const eventsRef = adminDb.collection("security_events");

  // Parallel hunting execution across correlation vectors
  const huntPromises: Promise<any>[] = [];

  if (triggerEvent.user) {
    huntPromises.push(
      eventsRef
        .where("user", "==", triggerEvent.user)
        .get()
        .then(addResults)
    );
  }

  if (triggerEvent.source_ip) {
    huntPromises.push(
      eventsRef
        .where("source_ip", "==", triggerEvent.source_ip)
        .get()
        .then(addResults)
    );
  }

  // Wait for all hunt threads to complete
  await Promise.all(huntPromises);
  
  // Ensure the trigger event is present
  if (triggerEvent.id) {
    relatedEventsMap.set(triggerEvent.id, triggerEvent);
  }

  // Return chronologically sorted event timeline
  return Array.from(relatedEventsMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
