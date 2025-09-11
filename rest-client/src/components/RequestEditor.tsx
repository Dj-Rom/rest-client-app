import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendRequest, type RequestResult } from "../lib/request";
import { useVariableContext } from "../context/VariableContext";
import ResponseViewer from "./ResponseViewer";
import CodeGenerator from "./CodeGenerator";
import { getCurrentUser } from "../lib/auth";
import { saveRequest } from "../lib/api";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestInput {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  variables?: Record<string, string>;
}

const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];



export default function RequestEditor() {
  const { t } = useTranslation();
  const { variables } = useVariableContext();

  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<RequestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHeaderChange = (key: string, value: string) => {
    setHeaders((prev) => ({ ...prev, [key]: value }));
  };

  const findVariablesInUrl = (inputUrl: string) => {
    const stored = localStorage.getItem("rest-client-variables");
    if (!stored) return inputUrl;

    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(stored);
    } catch {
      return inputUrl;
    }

    Object.keys(parsed).forEach((key) => {
      inputUrl = inputUrl.replace(`{{${key}}}`, parsed[key]);
    });
    return inputUrl;
  };

  const handleSend = async () => {
    if (!url.trim()) return;

    const finalUrl = findVariablesInUrl(url);
    setUrl(finalUrl);
    setLoading(true);

    const start = performance.now();
    let userId = "";

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      userId = user.id;

      const result = await sendRequest({
        method,
        url: finalUrl,
        headers,
        body,
        variables,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setResponse(result);

      const duration = Math.round(performance.now() - start);
      await saveRequest(userId, method, finalUrl, result.status || 0, duration);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMessage =
          err instanceof Error ? err.message : typeof err === "string" ? err : "Request failed";

      const fallbackResponse: RequestResult = {
        status: 0,
        statusText: "Error",
        duration,
        data: null,
        headers: {},
        error: errorMessage,
      };

      setResponse(fallbackResponse);

      if (userId) {
        await saveRequest(userId, method, finalUrl, 0, duration, fallbackResponse.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-6">
        {/* Method & URL */}
        <div className="flex gap-2 items-center">
          <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="border px-2 py-1 rounded"
          >
            {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
            ))}
          </select>
          <input
              type="text"
              placeholder={t("url")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow border px-2 py-1 rounded"
          />
          <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-1 rounded"
              disabled={loading}
          >
            {loading ? "..." : t("send")}
          </button>
        </div>

        {/* Headers */}
        <div>
          <h3 className="font-semibold mb-2">{t("headers")}</h3>
          {Object.entries(headers).map(([key, value], idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const updated = { ...headers };
                      delete updated[key];
                      updated[newKey] = value;
                      setHeaders(updated);
                    }}
                    className="border px-2 py-1 w-1/3"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                    className="border px-2 py-1 w-2/3"
                />
              </div>
          ))}
          <button
              onClick={() => handleHeaderChange("", "")}
              className="text-sm text-blue-600 mt-2"
          >
            + Add Header
          </button>
        </div>

        {/* Body */}
        <div>
          <h3 className="font-semibold mb-2">{t("body")}</h3>
          <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Response & Code Generator */}
        {response && <ResponseViewer response={response} />}
        <CodeGenerator
            method={method}
            url={findVariablesInUrl(url)}
            header={Object.entries(headers).map(([key, value]) => ({ key, value }))}
            body={body}
        />
      </div>
  );
}
