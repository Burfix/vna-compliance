import { getStores } from "@/lib/stores";
import StoresClient from "./StoresClient";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const stores = await getStores();

  console.log("[StoresPage] Loaded", stores.length, "stores. First 3 IDs:", stores.slice(0, 3).map(s => s.id));

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999999,
          background: "cyan",
          color: "black",
          fontWeight: 900,
          fontSize: 16,
          padding: 12,
          textAlign: "center",
          borderBottom: "4px solid teal",
        }}
      >
        STORES LIST LOADED — {stores.length} stores — build:{" "}
        {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"} — links use store.id
      </div>
      <div style={{ height: 60 }} />
      <StoresClient stores={stores} />
    </div>
  );
}
