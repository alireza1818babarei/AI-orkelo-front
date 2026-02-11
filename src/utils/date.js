const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function safeDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMonthDay(isoString, { useUTC = true, fallback = "-" } = {}) {
  const d = safeDate(isoString);
  if (!d) return fallback;

  const m = useUTC ? d.getUTCMonth() : d.getMonth();
  const day = useUTC ? d.getUTCDate() : d.getDate();

  return `${MONTHS[m]} ${day}`;
}

export function formatFullDate(isoString, { useUTC = true, fallback = "-" } = {}) {
  const d = safeDate(isoString);
  if (!d) return fallback;

  const m = useUTC ? d.getUTCMonth() : d.getMonth();
  const day = useUTC ? d.getUTCDate() : d.getDate();
  const year = useUTC ? d.getUTCFullYear() : d.getFullYear();

  return `${MONTHS[m]} ${day} ${year}`;
}
