import { useTranslation } from "react-i18next";
import VariableManager from "../components/VariableManager";

export default function VariablesPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">{t("variables")}</h1>
      <VariableManager />
    </div>
  );
}
