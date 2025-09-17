import type { RequestResult } from "../lib/request";
import { useTranslation } from "react-i18next";

interface Props {
  response: RequestResult;
}

export default function ResponseViewer({ response }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-bold">{t("response")}</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold">{t("status")}:</span>{" "}
          <span
            className={
              response.status >= 400 ? "text-red-600" : "text-green-600"
            }
          >
            {response.status} {response.statusText}
          </span>
        </div>
        <div>
          <span className="font-semibold">{t("duration")}:</span>{" "}
          {response.duration}ms
        </div>
      </div>

      {response.error && (
        <div className="text-red-600 text-sm">
          <strong>{t("error")}:</strong> {response.error}
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-1">Headers</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(response.headers, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Body</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {typeof response.data === "object"
            ? JSON.stringify(response.data, null, 2)
            : String(response.data)}
        </pre>
      </div>
    </div>
  );
}
