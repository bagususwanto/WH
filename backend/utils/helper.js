export function formatDate(isoString, options = {}) {
  const date = new Date(isoString);

  // Default options
  const defaultOptions = {
    weekday: "long", // Kamis
    year: "numeric", // 2025
    month: "long", // Juni
    day: "numeric", // 5
    hour: "2-digit", // 15
    minute: "2-digit", // 11
    second: "2-digit", // 34
    timeZone: "Asia/Jakarta",
    hour12: false, // Format 24 jam
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return date.toLocaleString("id-ID", mergedOptions);
}
