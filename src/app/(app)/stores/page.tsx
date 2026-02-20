import { getStores } from "@/lib/stores";
import {
  getFilteredStores,
  parseStoreFilter,
  getFilterMeta,
} from "@/lib/store-filters";
import StoresClient from "./StoresClient";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoresPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = parseStoreFilter(params.filter as string | undefined);
  const search = (params.q as string) ?? "";
  const precinct = (params.precinct as string) ?? "";
  const category = (params.category as string) ?? "";

  const hasFilter = filter !== "all";
  const meta = getFilterMeta(filter);

  // Use filtered path when filter param is present, otherwise the original getStores
  let stores;
  let totalBeforeFilter: number | undefined;

  if (hasFilter || search || precinct || category) {
    const result = await getFilteredStores(filter, search, precinct, category);
    stores = result.stores;
    totalBeforeFilter = result.totalBeforeFilter;
  } else {
    stores = await getStores();
  }

  return (
    <div>
      <StoresClient
        stores={stores}
        filterMeta={{
          filter,
          title: meta.title,
          description: meta.description,
          icon: meta.icon,
          count: stores.length,
          totalStores: totalBeforeFilter,
        }}
        initialSearch={search}
      />
    </div>
  );
}
