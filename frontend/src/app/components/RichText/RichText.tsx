import { useMemo } from "react";
import { parseRichText, type InlineNode } from "@/app/utils/richText";

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) =>
        node.type === "strong" ? (
          <strong key={i} className="font-semibold">
            {node.value}
          </strong>
        ) : (
          <span key={i}>{node.value}</span>
        ),
      )}
    </>
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = useMemo(() => parseRichText(text), [text]);

  return (
    <div className="space-y-2.5 break-words [overflow-wrap:anywhere]">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <p key={i} className="font-semibold">
              <Inline nodes={block.content} />
            </p>
          );
        }
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={i}
              start={block.ordered ? block.start : undefined}
              className={`space-y-1.5 pl-5 ${block.ordered ? "list-decimal" : "list-disc"} marker:text-ink-muted`}
            >
              {block.items.map((item, j) => (
                <li key={j} className="pl-1">
                  <Inline nodes={item} />
                </li>
              ))}
            </ListTag>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <Inline nodes={line} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
