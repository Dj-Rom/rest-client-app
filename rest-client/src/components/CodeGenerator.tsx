import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sanitizeRequest } from "../lib/codegenUtils";

interface HeaderItem {
  key: string;
  value: string;
}

interface Props {
  method: string;
  url: string;
  header: HeaderItem[];
  body: string;
}

const LANGUAGE_OPTIONS = [
  { key: "curl", label: "cURL" },
  { key: "javascript", label: "JavaScript (fetch)" },
  { key: "python", label: "Python (requests)" },
] as const;

type Language = (typeof LANGUAGE_OPTIONS)[number]["key"];


export default function CodeGenerator({ method, url, header, body }: Props) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<Language>("curl");
  const [snippet, setSnippet] = useState("");
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    const headersObj: Record<string, string> = {};
    header?.forEach(({ key, value }) => {
      if (key) headersObj[key] = value;
    });

    const bodyString = body ?? "";



    const {
      url: finalUrl,
      header: finalHeaders,
      body: finalBody,
    } = sanitizeRequest({
      method,
      url,
      headers: headersObj,
      body: bodyString,
    });

    const generateSnippet = () => {
      switch (language) {
        case "curl": {
          const curlHeaders = Object.entries(finalHeaders || {})
            .map(([k, v]) => `-H "${k}: ${v}"`)
            .join(" \\\n  ");
          const headerPart = curlHeaders ? curlHeaders + " \\\n  " : "";
          const bodyString =
            typeof finalBody === "object"
              ? JSON.stringify(finalBody, null, 2)
              : finalBody;

          const curlBody =
            bodyString && !["GET", "HEAD"].includes(method.toUpperCase())
              ? `--data '${bodyString}' \\\n  `
              : "";

          return `curl -X ${method} \\\n  ${headerPart}${curlBody}"${finalUrl}"`;
        }

        case "javascript":
          return `fetch("${finalUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(finalHeaders || {}, null, 2)},
  body: ${finalBody ? JSON.stringify(finalBody) : "undefined"}
})`;

        case "python":
          return `import requests
import json

response = requests.request(
  "${method}",
  "${finalUrl}",
  headers=${JSON.stringify(finalHeaders || {}, null, 2)},
  data=${finalBody ? `json.dumps(${JSON.stringify(finalBody)})` : "None"}
)

print(response.text)`;

        default:
          return "// Unsupported language";
      }
    };

    setSnippet(generateSnippet());
  }, [method, url, header, body, language]);

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
          onChange={(e) => setLanguage(e.target.value as Language)}
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
          aria-live="polite"
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
