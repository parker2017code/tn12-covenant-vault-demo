export async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchJsonMap(paths) {
  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await fetchJson(path)])
  );
  return Object.fromEntries(entries);
}
