import { replaceVariables } from "./replaceVariables";

interface RequestInput {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  variables: Record<string, string>;
}

export interface RequestResult {
  method: string;
  url: string;
  status: number;
  statusText: string;
  duration: number;
  data: string | object | null;
  headers: Record<string, string>;
  error?: string;
}

async function tryFetch(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string,
): Promise<Response> {
  return fetch(url, {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method.toUpperCase()) ? undefined : body,
  });
}

function wrapWithCorsProxy(url: string): string {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}

export async function sendRequest({
  method,
  url,
  headers,
  body,
  variables,
}: RequestInput): Promise<RequestResult> {
  const {
    url: finalUrl,
    headers: finalHeaders,
    body: finalBody,
  } = replaceVariables({ url, headers, body, variables });

  let requestUrl = finalUrl;
  if (!/^https?:\/\//i.test(requestUrl)) {
    requestUrl = `http://${requestUrl}`;
  }

  const start = performance.now();
  let response: Response | null = null;
  let lastError: unknown = null;

  // Try HTTP then HTTPS
  for (const protocol of ["http://", "https://"]) {
    const candidateUrl = requestUrl.replace(/^https?:\/\//i, protocol);
    try {
      response = await tryFetch(method, candidateUrl, finalHeaders, finalBody);
      requestUrl = candidateUrl;
      break;
    } catch (err) {
      lastError = err;
      response = null;
    }
  }

  // Try proxy only if both failed
  if (!response) {
    try {
      const proxiedUrl = wrapWithCorsProxy(requestUrl);
      response = await tryFetch(method, proxiedUrl, finalHeaders, finalBody);
    } catch (err) {
      lastError = err;
      response = null;
    }
  }

  const duration = performance.now() - start;

  if (!response) {
    return {
      method,
      url: requestUrl,
      status: 0,
      statusText: "Network Error",
      duration: Math.round(duration),
      data: null,
      headers: {},
      error:
        lastError instanceof Error
          ? lastError.message
          : "Could not connect to server (timed out or blocked by CORS)",
    };
  }

  const contentType = response.headers.get("content-type");
  let data: string | object | null = null;

  try {
    data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    data = null;
  }

  const headersObj: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  return {
    method,
    url: requestUrl,
    status: response.status,
    statusText: response.statusText,
    duration: Math.round(duration),
    data,
    headers: headersObj,
    error: response.status >= 400 ? `HTTP ${response.status}` : undefined,
  };
}
