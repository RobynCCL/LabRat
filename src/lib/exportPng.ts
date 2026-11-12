/** Render an on-screen SVG (the lab) to a captioned PNG and download it. */
export async function exportSvgToPng(svg: SVGSVGElement, opts: { title: string; subtitle: string; filename: string; dark?: boolean; footer: string }) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('[data-export-ignore]').forEach((n) => n.remove());
  const vb = svg.viewBox.baseVal;
  clone.setAttribute('width', String(vb.width));
  clone.setAttribute('height', String(vb.height));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  await img.decode();

  const scale = 2;
  const header = 76;
  const footer = 40;
  const margin = 24;
  const cw = vb.width + margin * 2;
  const ch = vb.height + header + footer;
  const canvas = document.createElement('canvas');
  canvas.width = cw * scale;
  canvas.height = ch * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  const g = ctx.createLinearGradient(0, 0, cw, ch);
  if (opts.dark) {
    g.addColorStop(0, '#11151c');
    g.addColorStop(1, '#1d2a33');
  } else {
    g.addColorStop(0, '#e6f4f1');
    g.addColorStop(1, '#fbeee0');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  ctx.fillStyle = opts.dark ? '#e8eef2' : '#1e2330';
  ctx.font = "600 28px 'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif";
  ctx.fillText(opts.title, margin, 44);
  ctx.fillStyle = opts.dark ? '#96a0b0' : '#687080';
  ctx.font = "600 15px 'Nunito Variable', system-ui, sans-serif";
  ctx.fillText(opts.subtitle, margin, 66);

  ctx.drawImage(img, margin, header - 8, vb.width, vb.height);

  ctx.fillStyle = opts.dark ? '#2dbeac' : '#0f766e';
  ctx.font = "600 14px 'Fredoka Variable', system-ui, sans-serif";
  ctx.textAlign = 'right';
  ctx.fillText(opts.footer, cw - margin, ch - 16);

  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG export failed'))), 'image/png'));
  downloadBlob(blob, opts.filename);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(text: string, filename: string, type = 'application/json') {
  downloadBlob(new Blob([text], { type }), filename);
}
