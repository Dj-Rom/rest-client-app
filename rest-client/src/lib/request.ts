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
  data: string | Record<string, unknown> | null;
  headers: Record<string, string>;
  error?: string;
}

export async function sendRequest({
  method,
  url,
  headers,
  body,
  variables,
}: RequestInput): Promise<RequestResult> {
  try {
    const {
      url: finalUrl,
      headers: finalHeaders,
      body: finalBody,
    } = replaceVariables({
      url,
      headers,
      body,
      variables,
    });

    const start = performance.now();

    const response = await fetch(finalUrl, {
      method,
      headers: finalHeaders,
      body: ["GET", "HEAD"].includes(method.toUpperCase())
        ? undefined
        : finalBody,
    });

    const duration = performance.now() - start;

    let data: string | Record<string, unknown>;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = (await response.json()) as Record<string, unknown>;
    } else {
      data = await response.text();
    }

    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    return {
      method,
      url: finalUrl,
      status: response.status,
      statusText: response.statusText,
      duration: Math.round(duration),
      data,
      headers: headersObj,
    };
  } catch (error) {
    const duration = performance.now();
    return {
      method,
      url,
      status: 0,
      statusText: "Network Error",
      duration: Math.round(duration),
      data: null,
      headers: {},
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error",
    };
  }
}
