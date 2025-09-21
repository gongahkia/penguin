// Simple date formatting utilities to replace date-fns
export const format = (date: Date, formatString: string): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const formatMap: Record<string, string> = {
    'HH': pad(date.getHours()),
    'mm': pad(date.getMinutes()),
    'ss': pad(date.getSeconds()),
    'MMM': date.toLocaleString('default', { month: 'short' }),
    'dd': pad(date.getDate()),
    'yyyy': date.getFullYear().toString(),
  };

  return formatString.replace(/HH|mm|ss|MMM|dd|yyyy/g, (match) => formatMap[match] || match);
};