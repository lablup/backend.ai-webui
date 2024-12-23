/**
 * Download a file from the given blob.
 * @param {Blob} blob - The file content.
 * @param {string} filename - The name of the file.
 */

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
