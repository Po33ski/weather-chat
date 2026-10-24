// A deliberately tiny Markdown subset for assistant replies (paragraphs,
// bullet/numbered lists, **bold**). The output is plain data rendered as React
// elements — never HTML — so LLM text can't inject markup.

export type InlineNode = { type: "text" | "strong"; value: string };

export type Block =
  | { type: "paragraph"; lines: InlineNode[][] }
  | { type: "heading"; content: InlineNode[] }
  | { type: "list"; ordered: boolean; start: number; items: InlineNode[][] };

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;
const BOLD = /\*\*(.+?)\*\*|__(.+?)__/g;

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(BOLD)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push({ type: "text", value: text.slice(lastIndex, index) });
    nodes.push({ type: "strong", value: match[1] ?? match[2] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push({ type: "text", value: text.slice(lastIndex) });
  return nodes;
}

export function parseRichText(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: InlineNode[][] = [];
  let list: Extract<Block, { type: "list" }> | null = null;

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph });
    if (list) blocks.push(list);
    paragraph = [];
    list = null;
  };

  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = HEADING.exec(line);
    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);

    if (heading) {
      flush();
      blocks.push({ type: "heading", content: parseInline(heading[1].trim()) });
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (paragraph.length || (list && list.ordered !== ordered)) flush();
      list ??= { type: "list", ordered, start: numbered ? Number(numbered[1]) : 1, items: [] };
      const itemText = bullet ? bullet[1] : (numbered?.[2] ?? "");
      list.items.push(parseInline(itemText.trim()));
    } else if (list && /^\s{2,}\S/.test(line)) {
      // Indented continuation of the previous list item.
      list.items[list.items.length - 1].push({ type: "text", value: ` ${line.trim()}` });
    } else {
      if (list) flush();
      paragraph.push(parseInline(line.trim()));
    }
  }
  flush();
  return blocks;
}
