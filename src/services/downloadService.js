/*
 * File Path: src/services/downloadService.js
 * Description: Client-side utility service for generating and triggering plain-text report & receipt file downloads.
 * Parameters: filename (string), content (string).
 */
export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
