import { DIFF_POINTS } from '../constants';

/**
 * Parse a .md question file into a question object.
 * @param {string} filename
 * @param {string} text  - raw file contents
 */
export function parseMarkdown(filename, text) {
  // ── Frontmatter ────────────────────────────────────────────────────────────
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  let meta = {}, body = text;

  if (fm) {
    fm[1].split(/\r?\n/).forEach(line => {
      const i = line.indexOf(':');
      if (i > -1) {
        const key = line.slice(0, i).trim();
        const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
        meta[key] = val;
      }
    });
    body = fm[2];
  }

  // ── Body ───────────────────────────────────────────────────────────────────
  const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let qLines = [], opts = {}, correct = null;

  for (const line of lines) {
    const optMatch = line.match(/^([A-D])[):]\s+(.+)$/);
    const corMatch = line.match(/^correct:\s*([A-D])\s*$/i);

    if (optMatch)      opts[optMatch[1]] = optMatch[2].trim();
    else if (corMatch) correct = corMatch[1].toUpperCase();
    else if (!Object.keys(opts).length)
      qLines.push(line.replace(/^#+\s*/, '').trim());
  }

  const diff = Math.min(5, Math.max(1, parseInt(meta.difficulty) || 1));

  return {
    id:         filename,
    question:   qLines.join(' ').trim(),
    options:    opts,
    correct,
    timer:      Math.max(5, parseInt(meta.timer) || 30),
    difficulty: diff,
    points:     DIFF_POINTS[diff],
    image:      meta.image || null,
    video:      meta.video || null,
  };
}