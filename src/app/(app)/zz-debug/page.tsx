export default function DebugPage() {
  return (
    <div
      style={{
        padding: 60,
        fontSize: 24,
        fontWeight: 900,
        textAlign: "center",
        background: "lime",
        minHeight: "100vh",
      }}
    >
      <p>✅ ZZ-DEBUG ROUTE IS LIVE</p>
      <p style={{ fontSize: 16, marginTop: 20 }}>
        Build: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "local"}
      </p>
      <p style={{ fontSize: 14, marginTop: 10, color: "#333" }}>
        If you see this, Vercel IS deploying your latest commit.
      </p>
    </div>
  );
}
