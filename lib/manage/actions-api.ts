import { apiFetch } from "@/lib/api/client";
import { getFrontendUrl } from "@/lib/api/config";

export type ManagedAction = {
  id: number;
  uuid: string;
  airtable_id: string | null;
  title: string;
  enabled: boolean;
  category: string | null;
};

export function fetchActions(): Promise<{ actions: ManagedAction[] }> {
  return apiFetch<{ actions: ManagedAction[] }>("/admin/actions");
}

export function actionUrl(action: ManagedAction): string {
  return getFrontendUrl(`/actions/system/${action.uuid}`);
}
