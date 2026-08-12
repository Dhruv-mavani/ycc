/**
 * Fetches a file download endpoint and triggers a browser download from
 * the response blob, instead of a bare `window.location.href` navigation
 * — which silently shows the raw JSON error body (or a blank tab) instead
 * of surfacing a message when the endpoint fails.
 */
export async function downloadFileOrThrow(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Download failed — please try again");
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}
