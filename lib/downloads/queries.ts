import { fetchDownloadables } from "@/lib/downloads/api";

export const downloadsKeys = {
  all: ["downloads"] as const,
  list: () => ["downloads", "list"] as const
};

export function downloadablesQuery() {
  return { queryKey: downloadsKeys.list(), queryFn: fetchDownloadables };
}
