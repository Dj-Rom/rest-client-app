import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sanitizeRequest } from "../lib/codegenUtils";

interface Props {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

const LANGUAGE_OPTIONS = [
  { key: "curl", label: "cURL" },
  { key: "javascript", label: "JavaScript (fetch)" },
  { key: "python", label: "Python (requests)" },
];

export default function CodeGenerator({ method, url, headers, body }: Props) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("curl");
  const [snippet, setSnippet] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const {
      url: finalUrl,
      headers: finalHeaders,
      body: finalBody,
    } = sanitizeRequest({
      method,
      url,
      headers,
      body,
    });

    const generateSnippet = () => {
      switch (language) {
        case "curl":
          const curlHeaders = Object.entries(finalHeaders || {})
            .map(([k, v]) => `-H "${k}: ${v}"`)
            .join(" ");
          const curlBody =
            finalBody && !["GET", "HEAD"].includes(method.toUpperCase())
              ? `--data '${finalBody}'`
              : "";
          return `curl -X ${method} ${curlHeaders} ${curlBody} "${finalUrl}"`;

        case "javascript":
          return `fetch("${finalUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(finalHeaders || {}, null, 2)},
  body: ${finalBody ? JSON.stringify(finalBody) : "undefined"}
})`;

        case "python":
          return `import requests

response = requests.request(
  "${method}",
  "${finalUrl}",
  headers=${JSON.stringify(finalHeaders || {}, null, 2)},
  data='${finalBody}'
)

print(response.text)`;
        default:
          return "// Unsupported language";
      }
    };

    setSnippet(generateSnippet());
  }, [method, url, headers, body, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">{t("codeGeneration")}</h2>
      <div className="flex items-center gap-2 mb-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.key} value={lang.key}>
              {lang.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleCopy}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
