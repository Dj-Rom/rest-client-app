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
  { key: "xhr", label: "JavaScript (XHR)" },
  { key: "nodejs", label: "NodeJS" },
  { key: "python", label: "Python (requests)" },
  { key: "java", label: "Java" },
  { key: "csharp", label: "C#" },
  { key: "go", label: "Go" },
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

    const sanitized = sanitizeRequest({
      method,
      url,
      headers: headersObj || {},
      body: bodyString || "",
    }) || {};

    const finalUrl = sanitized.url ?? url;
    const finalHeaders = sanitized.headers ?? {};
    const finalBody = sanitized.body ?? "";

    const generateSnippet = () => {
      const bodyStr =
          typeof finalBody === "object" ? JSON.stringify(finalBody, null, 2) : finalBody;
      Object.entries(finalHeaders)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
      switch (language) {
        case "curl": {
          const curlHeaders = Object.entries(finalHeaders)
              .map(([k, v]) => `-H "${k}: ${v}"`)
              .join(" \\\n  ");
          const headerPart = curlHeaders ? curlHeaders + " \\\n  " : "";
          const curlBody =
              bodyStr && !["GET", "HEAD"].includes(method.toUpperCase())
                  ? `--data '${bodyStr}' \\\n  `
                  : "";
          return `curl -X ${method} \\\n  ${headerPart}${curlBody}"${finalUrl}"`;
        }

        case "javascript":
          return `fetch("${finalUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(finalHeaders, null, 2)},
  body: ${finalBody ? JSON.stringify(finalBody) : "undefined"}
})`;

        case "xhr":
          return `const xhr = new XMLHttpRequest();
xhr.open("${method}", "${finalUrl}");
${Object.entries(finalHeaders)
              .map(([k, v]) => `xhr.setRequestHeader("${k}", "${v}");`)
              .join("\n")}
xhr.onload = () => console.log(xhr.responseText);
xhr.send(${bodyStr ? JSON.stringify(finalBody) : "null"});`;

        case "nodejs":
          return `const https = require("https");

const options = {
  method: "${method}",
  headers: ${JSON.stringify(finalHeaders, null, 2)}
};

const req = https.request("${finalUrl}", options, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log(data));
});
req.on("error", console.error);
req.write(${bodyStr ? JSON.stringify(finalBody) : '""'});
req.end();`;

        case "python":
          return `import requests
import json

response = requests.request(
  "${method}",
  "${finalUrl}",
  headers=${JSON.stringify(finalHeaders, null, 2)},
  data=${finalBody ? `json.dumps(${JSON.stringify(finalBody)})` : "None"}
)
print(response.text)`;

        case "java":
          return `import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;

URL url = new URL("${finalUrl}");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setRequestMethod("${method}");
${Object.entries(finalHeaders)
              .map(([k, v]) => `conn.setRequestProperty("${k}", "${v}");`)
              .join("\n")}
conn.setDoOutput(true);
try(OutputStream os = conn.getOutputStream()) {
  byte[] input = ${bodyStr ? JSON.stringify(finalBody) : '""'}.getBytes("utf-8");
  os.write(input, 0, input.length);
}
int code = conn.getResponseCode();`;

        case "csharp":
          return `using System.Net.Http;

var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${method.toLowerCase()}, "${finalUrl}");
${Object.entries(finalHeaders)
              .map(([k, v]) => `request.Headers.Add("${k}", "${v}");`)
              .join("\n")}
request.Content = new StringContent(${bodyStr ? JSON.stringify(finalBody) : '""'});
var response = await client.SendAsync(request);
var responseText = await response.Content.ReadAsStringAsync();
Console.WriteLine(responseText);`;

        case "go":
          return `package main
import (
  "bytes"
  "fmt"
  "net/http"
  "io/ioutil"
)

func main() {
  client := &http.Client{}
  req, _ := http.NewRequest("${method}", "${finalUrl}", bytes.NewBuffer([]byte(${bodyStr ? JSON.stringify(finalBody) : '""'})))
${Object.entries(finalHeaders)
              .map(([k, v]) => `  req.Header.Set("${k}", "${v}")`)
              .join("\n")}
  resp, _ := client.Do(req)
  defer resp.Body.Close()
  body, _ := ioutil.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;

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
