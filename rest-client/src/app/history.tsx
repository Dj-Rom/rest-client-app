import { useTranslation } from "react-i18next";
import HistoryList from "../components/HistoryList";

export default function HistoryPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">{t("history")}</h1>
      <HistoryList />
    </div>
  );
}
