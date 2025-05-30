export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Triggers a browser download of a base64-encoded file.
 *
 * @param base64Data - The base64 encoded string (without data URI prefix).
 * @param filename - The desired filename for the downloaded file.
 * @param mimeType - Optional MIME type, defaults to 'application/octet-stream'.
 */
export function downloadBase64File(
  base64Data: string,
  filename: string,
  mimeType: string = 'application/octet-stream'
) {
  if (!base64Data) {
    console.error('No base64 data provided for download.');
    return;
  }

  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: mimeType });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'backup.bin';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

export const calculateTooltipPosition = (
  x: number,
  y: number,
  tooltipHeight: number = 230, // Approximate height of tooltip
  horizontalOffset: number = 180,
  verticalOffset: number = 200
) => {
  // Get viewport dimensions
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Calculate initial position
  let finalX = x + horizontalOffset;
  let finalY = y + verticalOffset;

  // Check if tooltip would be clipped at the bottom
  if (finalY + tooltipHeight > viewportHeight) {
    // Position tooltip above the cursor instead
    finalY = y - tooltipHeight - 20; // 10px gap between cursor and tooltip
  }

  // Check if tooltip would be clipped at the right
  if (finalX + 300 > viewportWidth) {
    // Assuming tooltip width is ~300px
    finalX = x - 300 - 10; // Position tooltip to the left of cursor
  }

  return { x: finalX, y: finalY };
};
