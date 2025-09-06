import axios from "axios";
import type { Method, AxiosRequestHeaders } from "axios";
import { replaceVariables } from "./replaceVariables";

interface RequestInput {
  method: Method;
  url: string;
  headers: Record<string, string>;
  body: string;
  variables: Record<string, string>;
}

export interface RequestResult {
  status: number;
  statusText: string;
  duration: number;
  data: any;
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
  status: any;
  statusText: any;
  duration: number;
  data: any;
  headers: any;
  error: any;
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

    const response = await axios.request({
      method,
      url: finalUrl,
      headers: finalHeaders as AxiosRequestHeaders,
      data: ["GET", "HEAD"].includes(method.toUpperCase())
        ? undefined
        : finalBody,
    });

    const duration = performance.now() - start;

    return {
      error: undefined,
      status: response.status,
      statusText: response.statusText,
      duration: Math.round(duration),
      data: response.data,
      headers: response.headers,
    };
  } catch (error: any) {
    const duration = performance.now();
    return {
      status: error.response?.status ?? 0,
      statusText: error.response?.statusText ?? "Network Error",
      duration: Math.round(duration),
      data: error.response?.data ?? null,
      headers: error.response?.headers ?? {},
      error: error.message,
    };
  }
}
