type Variables = Record<string, string>;

export function replaceVariablesInString(
  input: string,
  variables?: Variables,
): string {
  // ✅ Fallback to localStorage if no variables are passed
  const resolvedVariables: Variables =
    variables ??
    (() => {
      try {
        const stored = localStorage.getItem("rest-client-variables");
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    })();

  return input.replace(/{{(.*?)}}/g, (_, key) => {
    return resolvedVariables[key.trim()] ?? `{{${key}}}`;
  });
}

export function replaceVariables({
  url,
  headers,
  body,
  variables,
}: {
  url: string;
  headers: Record<string, string>;
  body: string;
  variables?: Variables; // ✅ optional now
}) {
  const replacedUrl = replaceVariablesInString(url, variables);

  const replacedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    replacedHeaders[key] = replaceVariablesInString(value, variables);
  }

  const replacedBody = replaceVariablesInString(body, variables);

  return {
    url: replacedUrl,
    headers: replacedHeaders,
    body: replacedBody,
  };
}
