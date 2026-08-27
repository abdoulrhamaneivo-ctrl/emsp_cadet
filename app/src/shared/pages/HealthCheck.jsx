/** Sonde API (doc 20 P08) — réponse minimale consommée par le monitoring. */
export default function HealthCheck() {
  return (
    <pre className="font-mono text-sm text-[var(--emsp-cream)]" data-testid="health-ok">
      {"{\"service\":\"emsp-connect-front\",\"statut\":\"ok\"}"}
    </pre>
  );
}
