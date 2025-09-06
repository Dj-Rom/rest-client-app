import { useTranslation } from "react-i18next";
import RequestEditor from "../components/RequestEditor";

export default function RestClientPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">{t("appName")}</h1>
      <RequestEditor />
    </div>
  );
}
