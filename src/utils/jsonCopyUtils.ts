import toast from 'react-hot-toast';

export const copyJsonToClipboard = (data: any, label: string = 'JSON') => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast.success(`${label} copied to clipboard`);
  } catch (error) {
    console.error('Copy failed:', error);
    toast.error(`Failed to copy ${label}`);
  }
};
