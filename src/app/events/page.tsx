import { adminDb } from "@/lib/firebase/admin";
import { SecurityEvent } from "@/types";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { EventExplorerClient } from "@/components/events/EventExplorerClient";
import { serializeFirestore } from "@/lib/firebase/serialize";

export default async function EventExplorer() {
  let events: SecurityEvent[] = [];

  try {
    const eventsQuery = await adminDb.collection("security_events").orderBy("timestamp", "desc").limit(150).get();
    events = eventsQuery.docs.map((d: QueryDocumentSnapshot) => {
      return serializeFirestore<SecurityEvent>({
        ...d.data(),
        id: d.id
      });
    });
  } catch (err) {
    console.warn("Static build-time fallback active for events:", err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#161B22] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight flex items-center gap-3 text-gray-100">
            Live Security Activity Stream
            <span className="text-xs font-mono px-2 py-0.5 border border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10">
              REAL-TIME LOG FEED
            </span>
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">
            Real-time feed of all computer logins, internet connections, and programs running across company machines
          </p>
        </div>
        <div className="font-mono text-xs text-gray-400">
          <span>STORED IN FIREBASE: </span>
          <span className="text-[#00F0FF] font-bold">{events.length} LOGS</span>
        </div>
      </header>

      <EventExplorerClient initialEvents={events} />
    </div>
  );
}
