import { getStores } from "@/lib/stores";
import StoresClient from "./StoresClient";

export default async function StoresPage() {
  const stores = await getStores();
  
  return (
    <div>
      <div className="bg-cyan-500 text-white px-4 py-2 text-center font-bold mb-4">
        🎯 STORES LIST PAGE LOADED ✅ ({stores.length} stores)
      </div>
      <StoresClient stores={stores} />
    </div>
  );
}
