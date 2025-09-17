import { useState, useEffect } from "react";

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
] as const;
type Language = (typeof LANGUAGE_OPTIONS)[number]["key"];

export default function CodeGenerator({ method, url, header, body }: Props) {
  const [language, setLanguage] = useState<Language>("curl");
  const [snippet, setSnippet] = useState("");

  useEffect(() => {
    const headersObj: Record<string, string> = {};
    header.forEach(({ key, value }) => {
      if (key) headersObj[key] = value;
    });
    const bodyStr = body ?? "";

    const generateSnippet = () => {
      switch (language) {
        case "curl":
          const curlHeaders = Object.entries(headersObj)
            .map(([k, v]) => `-H "${k}: ${v}"`)
            .join(" \\\n  ");
          const headerPart = curlHeaders ? curlHeaders + " \\\n  " : "";
          const curlBody =
            bodyStr && !["GET", "HEAD"].includes(method.toUpperCase())
              ? `--data '${bodyStr}' \\\n  `
              : "";
          return `curl -X ${method} \\\n  ${headerPart}${curlBody}"${url}"`;

        case "javascript":
          return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headersObj, null, 2)},
  body: ${bodyStr ? JSON.stringify(bodyStr) : "undefined"}
})`;
      }
    };

    setSnippet(generateSnippet());
  }, [method, url, header, body, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="px-2 py-1 border rounded"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.key} value={l.key}>
              {l.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleCopy}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
        >
          Copy
        </button>
      </div>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
