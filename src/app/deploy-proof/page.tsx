import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Zero-dependency deployment verification page.
 * NOT inside (app) route group — no (app) layout, no sidebar, no auth, no DB.
 * Uses the root layout only. If this renders, Vercel IS serving your latest push.
 */
export default function DeployProofPage() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "not-set";
  const publicSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "not-set";
  const env = process.env.NODE_ENV ?? "unknown";
  const now = new Date().toISOString();

  return (
    <div
      style={{
        padding: 40,
        background: "#00FF88",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "monospace",
      }}
    >
      <h1 style={{ fontSize: 32, margin: 0 }}>
        ✅ DEPLOY PROOF — VERCEL IS SERVING THIS BUILD
      </h1>
      <table
        style={{
          borderCollapse: "collapse",
          fontSize: 18,
          background: "white",
          border: "3px solid black",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "8px 16px", fontWeight: 900, borderBottom: "1px solid #ccc" }}>Commit SHA</td>
            <td style={{ padding: "8px 16px", borderBottom: "1px solid #ccc" }}>{sha}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 16px", fontWeight: 900, borderBottom: "1px solid #ccc" }}>Public SHA</td>
            <td style={{ padding: "8px 16px", borderBottom: "1px solid #ccc" }}>{publicSha}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 16px", fontWeight: 900, borderBottom: "1px solid #ccc" }}>NODE_ENV</td>
            <td style={{ padding: "8px 16px", borderBottom: "1px solid #ccc" }}>{env}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 16px", fontWeight: 900 }}>Server time</td>
            <td style={{ padding: "8px 16px" }}>{now}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 14, color: "#333", marginTop: 16 }}>
        Compare the Commit SHA above with your Vercel deployment dashboard.
        <br />
        If they match, your code IS deployed. If not, check your branch settings.
      </p>
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/stores" style={{ padding: "8px 20px", background: "#0070F3", color: "white", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>
          → /stores
        </Link>
        <Link href="/api/debug-store" style={{ padding: "8px 20px", background: "#333", color: "white", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>
          → /api/debug-store
        </Link>
        <Link href="/dashboard" style={{ padding: "8px 20px", background: "#7C3AED", color: "white", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>
          → /dashboard
        </Link>
      </div>
    </div>
  );
}
