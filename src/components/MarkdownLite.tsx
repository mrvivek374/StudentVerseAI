import React from "react";

/**
 * Minimal, safe Markdown renderer for AI answers.
 *
 * - Produces React elements only; never uses dangerouslySetInnerHTML, so any
 *   injected HTML or scripts in AI output are inert and escaped automatically.
 * - Supports: headings, bold/italic/inline-code, fenced code blocks with
 *   lightweight syntax highlighting, ordered/unordered lists, blockquotes,
 *   simple pipe tables, and horizontal rules.
 */

type Inline = React.ReactNode;

/** Inline markdown: bold, italic (incl. `_x_`), inline code, and links. */
function renderInline(text: string, keyBase: string): Inline[] {
  const out: Inline[] = [];
  // Order matters: code spans first so their content isn't further processed.
  const pattern = /(`[^`]+`)|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) {
      out.push(
        <code key={k} className="px-1 py-0.5 rounded bg-black/25 border border-[var(--bg-card-border)] text-cyan text-[0.85em]">
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("***")) {
      out.push(<strong key={k} className="italic font-bold">{tok.slice(3, -3)}</strong>);
    } else if (tok.startsWith("**")) {
      out.push(<strong key={k} className="font-bold text-[var(--text-primary)]">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("__")) {
      out.push(<strong key={k} className="font-bold text-[var(--text-primary)]">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("_")) {
      out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("[")) {
      const link = tok.match(/\[([^\]]+)\]\(([^)\s]+)\)/);
      if (link) {
        out.push(
          <a key={k} href={link[2]} target="_blank" rel="noopener noreferrer nofollow" className="text-cyan underline">
            {link[1]}
          </a>
        );
      } else out.push(tok);
    } else {
      out.push(tok);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Very small JSX-level highlighter: keywords, strings, comments, numbers. */
function highlightCode(code: string, lang: string, keyBase: string): React.ReactNode {
  const kw =
    /\b(const|let|var|function|return|if|else|elif|for|while|do|switch|case|break|continue|new|class|def|lambda|import|from|as|with|try|catch|finally|raise|public|private|protected|static|void|int|float|double|bool|boolean|char|True|False|None|null|undefined|true|false|async|await|yield|struct|enum|type|interface|extends|implements|in|is|not|and|or|print|pass)\b/g;
  const lines = code.split("\n");
  const tokenRe = new RegExp(`(#.*$|//.*$|"""[\\s\\S]*?"""|'[^'\\n]*'|"[^"\\n]*"|\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?\\b|\\b(?:${kw.source.slice(2, -3)})\\b)`, "g");

  return lines.map((line, li) => {
    const parts: React.ReactNode[] = [];
    let last = 0;
    let mm: RegExpExecArray | null;
    let idx = 0;
    tokenRe.lastIndex = 0;
    while ((mm = tokenRe.exec(line))) {
      if (mm.index > last) parts.push(line.slice(last, mm.index));
      const tok = mm[0];
      const k = `${keyBase}-${li}-${idx++}`;
      let cls = "";
      if (tok.startsWith("#") || tok.startsWith("//")) cls = "text-slate-500 italic";
      else if (tok.startsWith("'") || tok.startsWith('"') || tok.startsWith('"""')) cls = "text-amber-300";
      else if (/^[\d]/.test(tok)) cls = "text-violet-300";
      else cls = "text-teal font-semibold";
      parts.push(<span key={k} className={cls}>{tok}</span>);
      last = mm.index + tok.length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return (
      <span key={li}>
        {parts}
        {li < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

type Block =
  | { kind: "code"; lang: string; body: string }
  | { kind: "heading"; level: number; body: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; body: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "hr" }
  | { kind: "p"; body: string };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing fence (or EOF)
      blocks.push({ kind: "code", lang: fence[1] || "", body: body.join("\n") });
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ kind: "heading", level: h[1].length, body: h[2].trim() });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(line) && line.trim().length >= 3 && /^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    // Table: header row | separator | rows
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const header = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    // Lists (indented up to 3 spaces)
    const ulm = line.match(/^\s*[-*+]\s+(.*)$/);
    const olm = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (ulm || olm) {
      const ordered = !!olm;
      const items: string[] = [];
      while (i < lines.length) {
        const um = lines[i].match(/^\s*[-*+]\s+(.*)$/);
        const om = lines[i].match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (ordered && om) items.push(om[2]);
        else if (!ordered && um) items.push(um[1]);
        else if (items.length && /^\s{2,}\S/.test(lines[i]) && !um && !om) items[items.length - 1] += " " + lines[i].trim();
        else break;
        i++;
      }
      blocks.push(ordered ? { kind: "ol", items } : { kind: "ul", items });
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ kind: "quote", body });
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph (consume until blank line or special block start)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i]) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^\s*[-*+]\s/.test(lines[i]) &&
      !/^\s*\d+[.)]\s/.test(lines[i]) &&
      !/^\s*>/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) blocks.push({ kind: "p", body: para.join("\n") });
    else i++;
  }

  return blocks;
}

export function MarkdownLite({ text }: { text: string }) {
  const blocks = React.useMemo(() => parseBlocks(text ?? ""), [text]);

  return (
    <div className="md-lite text-sm leading-relaxed">
      {blocks.map((b, bi) => {
        const kb = `b${bi}`;
        switch (b.kind) {
          case "code":
            return (
              <div key={kb} className="my-2.5 rounded-lg overflow-hidden border border-[var(--bg-card-border)] bg-black/30">
                {b.lang && <div className="text-[10px] uppercase tracking-wider px-3 py-1.5 text-secondary border-b border-[var(--bg-card-border)]">{b.lang}</div>}
                <pre className="p-3 overflow-x-auto scrollbar-thin text-[12.5px] leading-relaxed font-mono">
                  <code>{highlightCode(b.body, b.lang, kb)}</code>
                </pre>
              </div>
            );
          case "heading": {
            const size = b.level === 1 ? "text-base" : b.level === 2 ? "text-[15px]" : "text-[14px]";
            return (
              <div key={kb} className={`font-bold ${size} mt-3 mb-1.5 text-[var(--text-primary)]`}>
                {renderInline(b.body, kb)}
              </div>
            );
          }
          case "ul":
            return (
              <ul key={kb} className="list-disc pl-5 my-1.5 space-y-1">
                {b.items.map((it, ii) => (
                  <li key={`${kb}-${ii}`}>{renderInline(it, `${kb}-${ii}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={kb} className="list-decimal pl-5 my-1.5 space-y-1">
                {b.items.map((it, ii) => (
                  <li key={`${kb}-${ii}`}>{renderInline(it, `${kb}-${ii}`)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={kb} className="border-l-2 border-teal/50 pl-3 my-2 text-secondary italic">
                {b.body.map((l, li) => (
                  <div key={`${kb}-${li}`}>{renderInline(l, `${kb}-${li}`)}</div>
                ))}
              </blockquote>
            );
          case "table":
            return (
              <div key={kb} className="my-2.5 overflow-x-auto scrollbar-thin">
                <table className="text-xs border border-[var(--bg-card-border)] rounded-lg w-full">
                  <thead>
                    <tr className="bg-white/5">
                      {b.header.map((h, hi) => (
                        <th key={`${kb}-h${hi}`} className="px-2.5 py-1.5 text-left font-semibold border-b border-[var(--bg-card-border)]">
                          {renderInline(h, `${kb}-h${hi}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={`${kb}-r${ri}`} className="border-b border-[var(--bg-card-border)] last:border-0">
                        {r.map((c, ci) => (
                          <td key={`${kb}-r${ri}c${ci}`} className="px-2.5 py-1.5">
                            {renderInline(c, `${kb}-r${ri}c${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={kb} className="my-3 border-[var(--bg-card-border)]" />;
          default:
            return (
              <p key={kb} className="my-1.5 whitespace-pre-wrap">
                {renderInline(b.body, kb)}
              </p>
            );
        }
      })}
    </div>
  );
}
