import { getTenantManagementData } from "./actions";
import StoresClient from "./StoresClient";
import { getEnv } from "@/lib/env";

export default async function StoresPage() {
  const env = getEnv();
  const data = await getTenantManagementData();
  
  return <StoresClient initialData={data} isMockMode={env.MOCK_MODE} />;
}
