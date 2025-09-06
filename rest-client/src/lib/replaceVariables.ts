type Variables = Record<string, string>;

export function replaceVariablesInString(
  input: string,
  variables: Variables,
): string {
  return input.replace(/{{(.*?)}}/g, (_, key) => {
    return variables[key.trim()] ?? `{{${key}}}`;
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
  variables: Variables;
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
