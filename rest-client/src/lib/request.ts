import { replaceVariables } from "./replaceVariables";

interface RequestInput {
  method: string; // Method from fetch is just string
  url: string;
  headers: Record<string, string>;
  body: string;
  variables: Record<string, string>;
}

export interface RequestResult {
  status: number;
  statusText: string;
  duration: number;
  data: null;
  headers: Record<string, string>;
  error?: string;
}

export async function sendRequest({
                                    method,
                                    url,
                                    headers,
                                    body,
                                    variables,
                                  }: RequestInput): Promise<{
  status: number;
  statusText: string;
  duration: number;
  data: object | null | string;
  headers: object;
  error: unknown
}> {

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
      body: ["GET", "HEAD"].includes(method.toUpperCase()) ? undefined : finalBody,
    });

    const duration = performance.now() - start;

    let data: object | string;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();

    } else {
      data = await response.text();

    }


    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    return {
      error: undefined,
      status: response.status,
      statusText: response.statusText,
      duration: Math.round(duration),
      data: data,
      headers: headersObj,
    };
  } catch (error: unknown) {
    const duration = performance.now();
    return {
      status: 0,
      statusText: "Network Error",
      duration: Math.round(duration),
      data: null,
      headers: {},
      error:  String(error),
    };
  }
}
