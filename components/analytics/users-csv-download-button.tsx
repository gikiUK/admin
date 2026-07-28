"use client";

import { CsvDownloadButton } from "@/components/analytics/insights/shared/csv-download-button";
import { USERS_EXPORT_ENDPOINT, type UsersFilter, usersExportBody } from "@/lib/analytics/api";

// Exports every user matching the active filters, name + email included.
export function UsersCsvDownloadButton({ filter }: { filter: UsersFilter }) {
  return (
    <CsvDownloadButton
      endpoint={USERS_EXPORT_ENDPOINT}
      body={usersExportBody(filter)}
      fallbackFilename="users.csv"
      label="Export CSV"
    />
  );
}
