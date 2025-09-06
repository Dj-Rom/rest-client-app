export function sanitizeRequest({
  method,
  url,
  headers,
  body,
}: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}) {
  return {
    method,
    url,
    header: Object.entries(headers).map(([key, value]) => ({
      key,
      value,
    })),
    body: {
      mode: "raw",
      raw: body,
    },
  };
}
