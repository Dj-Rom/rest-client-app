import { useTranslation } from "react-i18next";
import HistoryList from "../components/HistoryList";
import type { RequestMetadata } from "../lib/api.ts";

export interface HistoryListProps {
  onSelect?: (entry: RequestMetadata) => void; // опционально
}

export default function HistoryPage({ onSelect }: HistoryListProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">{t("history")}</h1>
      <HistoryList onSelect={onSelect} />
    </div>
  );
}
