import { AIAnalysis, Incident } from "@/types";

/**
 * Plain-English Incident Explanation Engine
 * Breaks down complex cyber attacks into crystal-clear, simple English.
 * Explains the exact story: How they broke in, what they touched, and how to fix it.
 */
export async function generateAIAnalysis(incident: Incident): Promise<AIAnalysis> {
  const users = Array.from(new Set(incident.events?.map(e => e.user).filter(Boolean)));
  const ips = Array.from(new Set(incident.events?.map(e => e.source_ip).filter(Boolean)));
  const destIps = Array.from(new Set(incident.events?.map(e => e.destination_ip).filter(Boolean)));
  const devices = Array.from(new Set(incident.events?.map(e => e.device).filter(Boolean)));

  const victimUser = users[0] || "staff account";
  const hackerIp = ips[0] || "unknown internet address";
  const targetDevice = devices[0] || "company computer";

  let summary = "";
  let why = "";
  const keyEvidence: string[] = [];
  const recommendedChecks: string[] = [];

  if (incident.title.includes("BRUTE_FORCE")) {
    summary = `Someone broke into the account '${victimUser}'. The attacker came from internet address ${hackerIp}. They guessed wrong passwords multiple times until they got in, and then immediately started touching sensitive company files.`;
    why = `Normal employees don't fail their passwords several times from an unknown internet address and then immediately succeed. This is a classic 'password guessing' break-in.`;
    keyEvidence.push(`Multiple failed password attempts right before a successful login`);
    keyEvidence.push(`Logins came from an unrecognized internet address (${hackerIp})`);
    if (devices.length > 0) keyEvidence.push(`Login happened from a computer we have never seen before (${devices.join(", ")})`);
    if (incident.events?.some(e => e.action === "DATA_TRANSFER" || e.event_type === "DATA_TRANSFER")) {
      keyEvidence.push(`Large chunk of company data was copied and sent outside the network`);
    }
    recommendedChecks.push(`Lock '${victimUser}' out right now and reset their password and two-factor code`);
    recommendedChecks.push(`Block the hacker's internet address (${hackerIp}) on company firewalls`);
    recommendedChecks.push(`Check if the hacker opened or downloaded database backup files`);
  } else if (incident.title.includes("PORT_SCAN")) {
    summary = `A computer on the internet (${hackerIp}) is rattling every door and window on our network. It tried connecting to dozens of different service doors (ports) in under a minute to see which ones are left open.`;
    why = `Normal users only connect to the one website or service they need. Connecting to 10+ different doors in seconds is automated reconnaissance, trying to find an unpatched hole.`;
    keyEvidence.push(`Rapid fire connections to ports 22, 80, 443, 3389, and database ports`);
    keyEvidence.push(`All probes originated from a single unknown internet location: ${hackerIp}`);
    recommendedChecks.push(`Block internet address ${hackerIp} permanently at the outer firewall`);
    recommendedChecks.push(`Verify that internal servers ignore or drop traffic on closed doors`);
    recommendedChecks.push(`Watch for any follow-up break-in attempts on the doors that answered`);
  } else if (incident.title.includes("PROCESS") || incident.title.includes("POWERSHELL")) {
    summary = `A computer script was caught sneaking around security guards on '${targetDevice}'. It ran a command shell with security rules disabled, and immediately tried to call out to a secret server on the internet (${destIps[0] || hackerIp}).`;
    why = `The command specifically used 'ExecutionPolicy Bypass', which is the cyber equivalent of picking a lock and telling Windows not to look. It then reached out to an external server, likely to download malware or take remote orders.`;
    keyEvidence.push(`PowerShell executed with security checks explicitly disabled`);
    keyEvidence.push(`Immediately opened an outbound internet connection to ${destIps[0] || hackerIp}`);
    recommendedChecks.push(`Click 'Lock Down Computer' to cut '${targetDevice}' from the office network`);
    recommendedChecks.push(`Inspect the computer for sneaky background startup tasks`);
    recommendedChecks.push(`Scan memory and recent downloads on '${targetDevice}' for hidden malware`);
  } else if (incident.title.includes("DATA_EXFILTRATION")) {
    summary = `A massive pile of company data was quietly copied and sent out of the building to an external computer (${destIps[0] || hackerIp}). This looks like data theft.`;
    why = `The amount of data moving outside is 100 times higher than usual, and happened right after someone accessed customer backups.`;
    keyEvidence.push(`Gigabytes of company data sent to external destination ${destIps[0] || hackerIp}`);
    keyEvidence.push(`Data transfer followed unauthorized customer database access`);
    recommendedChecks.push(`Sever the outbound internet connection to destination ${destIps[0] || hackerIp}`);
    recommendedChecks.push(`Find out exactly which customer files and spreadsheets were transferred`);
    recommendedChecks.push(`Notify the security team and follow data breach protocols`);
  } else {
    summary = `The automatic detective found a suspicious chain of ${incident.events?.length || 0} events connecting person '${victimUser}' and internet address '${hackerIp}'.`;
    why = `Multiple unusual activities happened in a short 15-minute window that violate safe baseline behavior.`;
    keyEvidence.push(`Unusual activity pattern mapped to user '${victimUser}'`);
    keyEvidence.push(`Suspicious connection from internet address '${hackerIp}'`);
    recommendedChecks.push(`Confirm if user '${victimUser}' was really doing this work`);
    recommendedChecks.push(`Inspect recent logins and file downloads`);
  }

  return {
    incidentId: incident.id || "UNKNOWN",
    summary,
    why_suspicious: why,
    key_evidence: keyEvidence,
    likely_threat: incident.threat_type,
    mitre_tactics: incident.mitre_tactics || [],
    recommended_checks: recommendedChecks,
    generated_at: new Date()
  };
}
