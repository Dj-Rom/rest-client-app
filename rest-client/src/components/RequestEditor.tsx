import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { sendRequest, type RequestResult } from "../lib/request";
import ResponseViewer from "./ResponseViewer";
import CodeGenerator from "./CodeGenerator";
import { replaceVariablesInString } from "../lib/replaceVariables";
import { saveRequest } from "../lib/api";
import { useAuthContext } from "../context/AuthContext";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

interface RequestEditorProps {
  restoreRequest?: {
    restoreRequest?: {
      method?: string | ((prevState: Method) => Method);
      url?: string;
      headers?: Record<string, string>;
      body?: string;
    } | null;
  } | null;
}

export default function RequestEditor({ restoreRequest }: RequestEditorProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<RequestResult | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!restoreRequest?.restoreRequest) return;
    const r = restoreRequest.restoreRequest;
    // @ts-expect-error allow functional updater
    setMethod(r.method ?? "GET");
    setUrl(r.url ?? "");
    setHeaders(r.headers ?? {});
    setBody(r.body ?? "");
  }, [restoreRequest]);

  const handleHeaderChange = (key: string, value: string) => {
    setHeaders((prev) => ({ ...prev, [key]: value }));
  };

  const handleSend = async () => {
    if (!url.trim()) return;

    const replacedUrl = replaceVariablesInString(url);
    setUrl(replacedUrl);
    setLoading(true);

    const tryUrls = [
      replacedUrl.startsWith("http://") || replacedUrl.startsWith("https://")
        ? replacedUrl
        : `http://${replacedUrl}`,
      replacedUrl.startsWith("http://") || replacedUrl.startsWith("https://")
        ? ""
        : `https://${replacedUrl}`,
    ].filter(Boolean);

    let lastError: unknown = null;

    for (const currentUrl of tryUrls) {
      try {
        const result = await sendRequest({
          method,
          url: currentUrl,
          headers,
          body,
          variables: {},
        });

        setResponse(result);
        if (user) {
          await saveRequest(
            user.id,
            result.method,
            result.url,
            result.status,
            result.duration,
            result.error ?? undefined,
          );
        }
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
      }
    }

    const failedResponse: RequestResult = {
      method,
      url,
      status: 0,
      statusText: "Error",
      duration: 0,
      data: null,
      headers: {},
      error:
        lastError instanceof Error
          ? lastError.message
          : typeof lastError === "string"
            ? lastError
            : "Unknown error",
    };

    setResponse(failedResponse);
    if (user) {
      await saveRequest(
        user.id,
        failedResponse.method,
        failedResponse.url,
        failedResponse.status,
        failedResponse.duration,
        failedResponse.error ?? undefined,
      );
    }

    setLoading(false);
  };

  function SendButton({
    loading,
    onClick,
    t,
  }: {
    loading: boolean;
    onClick: () => void;
    t: (key: string) => string;
  }) {
    const [dots, setDots] = useState("");

    useEffect(() => {
      if (!loading) {
        setDots("");
        return;
      }

      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);

      return () => clearInterval(interval);
    }, [loading]);

    return (
      <button
        onClick={onClick}
        className="bg-blue-600 text-white px-4 py-1 rounded"
        disabled={loading}
      >
        {loading ? `Wait${dots}` : t("send")}
      </button>
    );
  }

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
        <SendButton loading={loading} onClick={handleSend} t={t} />
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
        url={replaceVariablesInString(url)}
        header={Object.entries(headers).map(([key, value]) => ({ key, value }))}
        body={body}
      />
    </div>
  );
}
