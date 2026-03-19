const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function safeDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMonthDay(
  isoString,
  { useUTC = true, fallback = "-" } = {},
) {
  const d = safeDate(isoString);
  if (!d) return fallback;

  const m = useUTC ? d.getUTCMonth() : d.getMonth();
  const day = useUTC ? d.getUTCDate() : d.getDate();

  return `${MONTHS[m]} ${day}`;
}

export function formatFullDate(
  isoString,
  { useUTC = true, fallback = "-" } = {},
) {
  const d = safeDate(isoString);
  if (!d) return fallback;

  const m = useUTC ? d.getUTCMonth() : d.getMonth();
  const day = useUTC ? d.getUTCDate() : d.getDate();
  const year = useUTC ? d.getUTCFullYear() : d.getFullYear();

  return `${MONTHS[m]} ${day} ${year}`;
}

export function formatMonthDayTime(
  isoString,
  { useUTC = true, fallback = "-" } = {},
) {
  const d = safeDate(isoString);
  if (!d) return fallback;

  const m = useUTC ? d.getUTCMonth() : d.getMonth();
  const day = useUTC ? d.getUTCDate() : d.getDate();
  const hours = useUTC ? d.getUTCHours() : d.getHours();
  const minutes = useUTC ? d.getUTCMinutes() : d.getMinutes();

  const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

  return `${MONTHS[m]} ${day} ${timeString}`;
}

export const trackerTimeFormat = (seconds) => {
  if (seconds === 0) {
    return "No time submitted yet";
  } else if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (remainingMinutes > 0 && remainingSeconds > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}, ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;
    } else if (remainingMinutes > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}, ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    } else if (remainingSeconds > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}, ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
};
