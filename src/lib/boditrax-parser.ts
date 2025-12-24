export interface BoditraxRecord {
  date: string; // ISO string
  [key: string]: string | number;
}

export const parseBoditraxCSV = async (file: File): Promise<BoditraxRecord[]> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/);

  // 1. Find the "User Scan Details" header to start parsing
  const startIndex = lines.findIndex((line) =>
    line.toLowerCase().includes("user scan details")
  );

  if (startIndex === -1) {
    throw new Error("Invalid Boditrax CSV: 'User Scan Details' header not found.");
  }

  // Find the header row by looking for 'Date' and 'Value' keywords
  let dataStartIndex = startIndex + 1;
  const headerLineIndex = lines.slice(startIndex).findIndex(line =>
    line.toLowerCase().includes("date") && line.toLowerCase().includes("value")
  );

  if (headerLineIndex !== -1) {
    dataStartIndex = startIndex + headerLineIndex + 1;
  }

  const headers = lines[dataStartIndex - 1]?.split(",").map(h => h.trim().toLowerCase());

  // Mapping column indices
  const dateIdx = headers?.findIndex(h => h.includes("date") || h.includes("time"));
  const nameIdx = headers?.findIndex(h => h.includes("metric") || h.includes("parameter"));
  const valueIdx = headers?.findIndex(h => h.includes("value") || h.includes("result"));

  if (dateIdx === -1 || nameIdx === -1 || valueIdx === -1) {
    console.warn("Could not auto-detect columns, using defaults.");
  }

  const recordsByDate: Record<string, BoditraxRecord> = {};

  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

    // Default indices: Name=0, Value=1, Date=2 (based on sample observation)
    const metricName = cols[nameIdx !== -1 ? nameIdx : 0];
    const valueStr = cols[valueIdx !== -1 ? valueIdx : 1];
    const dateStr = cols[dateIdx !== -1 ? dateIdx : 2];

    if (!dateStr || !metricName) continue;

    // Normalizing Date
    let isoDate;
    try {
      // Handle DD/MM/YYYY format if needed, or default JS parse
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
      } else {
        isoDate = new Date(dateStr).toISOString();
      }
    } catch (e) {
      continue;
    }

    if (!recordsByDate[isoDate]) {
      recordsByDate[isoDate] = { date: isoDate };
    }

    const numValue = parseFloat(valueStr);
    // Pivot: Metric Name becomes the key
    recordsByDate[isoDate][metricName] = isNaN(numValue) ? valueStr : numValue;
  }

  return Object.values(recordsByDate).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
