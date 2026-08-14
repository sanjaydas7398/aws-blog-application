export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function excerpt(text, length = 160) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function entryNumber(index) {
  return `No. ${String(index + 1).padStart(3, "0")}`;
}
