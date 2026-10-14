export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const blob = new Blob(["\ufeff" + rows.map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const escHtml = (s: string | number | null | undefined) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

export function printHtml(title: string, subtitle: string, tableHtml: string, landscape = false) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${escHtml(title)}</title><style>
    @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 8mm }
    body { font-family: Georgia, serif; color: #111 }
    h1 { font-size: 16px; margin: 0; text-align: center } p { margin: 2px 0 8px; font-size: 10px; text-align: center }
    table { width: 100%; border-collapse: collapse; font-size: 7px }
    th, td { border: 1px solid #444; padding: 2px 3px; text-align: center; vertical-align: middle }
    th { background: #f1ead7; font-size: 7px } td { height: 22px; font-family: "Courier New", monospace }
  </style></head><body><h1>${escHtml(title)}</h1><p>${escHtml(subtitle)}</p>${tableHtml}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

export function printTable(title: string, subtitle: string, head: string[], body: (string | number | null | undefined)[][], landscape = false) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${escHtml(title)}</title><style>
    @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 14mm }
    body { font-family: Georgia, serif; color: #1c2a4a }
    h1 { font-size: 18px; margin: 0 } p { margin: 2px 0 14px; font-size: 12px; color: #555 }
    table { width: 100%; border-collapse: collapse; font-size: 11px }
    th, td { border: 1px solid #999; padding: 4px 6px; text-align: left } th { background: #efe9da }
  </style></head><body><h1>${escHtml(title)}</h1><p>${escHtml(subtitle)}</p>
  <table><thead><tr>${head.map((h) => `<th>${escHtml(h)}</th>`).join("")}</tr></thead>
  <tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${escHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
  </body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
