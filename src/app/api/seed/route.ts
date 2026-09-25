import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const origin = new URL(req.url).origin;
    const now = Date.now();

    const events = [
      // Scenario C: Suspicious process (older)
      { timestamp: new Date(now - 86400000).toISOString(), user: "j.smith", source_ip: "10.0.1.15", device: "CORP-LAP-02", event_type: "PROCESS_EXECUTION", process: "powershell.exe -ExecutionPolicy Bypass", severity: "HIGH" },
      { timestamp: new Date(now - 86350000).toISOString(), user: "j.smith", source_ip: "10.0.1.15", device: "CORP-LAP-02", event_type: "NETWORK_CONNECTION", action: "OUTBOUND", destination_ip: "185.12.55.1", severity: "MEDIUM" },

      // Scenario B: Port Scan
      { timestamp: new Date(now - 14400000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_22", severity: "INFO" },
      { timestamp: new Date(now - 14399000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_80", severity: "INFO" },
      { timestamp: new Date(now - 14398000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_443", severity: "INFO" },
      { timestamp: new Date(now - 14397000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_445", severity: "INFO" },
      { timestamp: new Date(now - 14396000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_3389", severity: "INFO" },
      { timestamp: new Date(now - 14395000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_1433", severity: "INFO" },
      { timestamp: new Date(now - 14394000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_8080", severity: "INFO" },
      { timestamp: new Date(now - 14393000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_8443", severity: "INFO" },
      { timestamp: new Date(now - 14392000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_21", severity: "INFO" },
      { timestamp: new Date(now - 14391000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_23", severity: "INFO" },
      { timestamp: new Date(now - 14390000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_53", severity: "INFO" },
      { timestamp: new Date(now - 14389000).toISOString(), source_ip: "45.33.22.1", destination_ip: "10.0.0.50", event_type: "NETWORK_CONNECTION", action: "PORT_111", severity: "INFO" },

      // Scenario A: Account Compromise (Most Recent)
      { timestamp: new Date(now - 300000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "LOGIN_FAILED", severity: "MEDIUM" },
      { timestamp: new Date(now - 290000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "LOGIN_FAILED", severity: "MEDIUM" },
      { timestamp: new Date(now - 275000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "LOGIN_SUCCESS", severity: "CRITICAL" },
      { timestamp: new Date(now - 265000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", device: "Unknown_Mac", event_type: "NEW_DEVICE_DETECTED", severity: "HIGH" },
      { timestamp: new Date(now - 200000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", event_type: "RESOURCE_ACCESS", action: "Database Backup", severity: "HIGH" },
      { timestamp: new Date(now - 180000).toISOString(), user: "alex.morgan", source_ip: "185.88.92.1", destination_ip: "45.101.22.9", event_type: "DATA_TRANSFER", action: "DATA_TRANSFER", metadata: { bytes: "4200000000" }, severity: "CRITICAL" }
    ];

    const response = await fetch(`${origin}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events)
    });

    const result = await response.json();
    return NextResponse.json({ success: true, message: "Database seeded for production demo.", result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
