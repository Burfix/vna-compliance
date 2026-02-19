import { getTenantManagementData } from "./actions";
import StoresClient from "./StoresClient";

export default async function StoresPage() {
  const data = await getTenantManagementData();
  
  return <StoresClient initialData={data} />;
}
