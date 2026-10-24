import { describe, expect, it } from "vitest";
import { parseInline, parseRichText } from "./richText";

describe("parseInline", () => {
  it("splits **bold** and __bold__ from plain text", () => {
    expect(parseInline("Visit **Wawel** and __Kazimierz__.")).toEqual([
      { type: "text", value: "Visit " },
      { type: "strong", value: "Wawel" },
      { type: "text", value: " and " },
      { type: "strong", value: "Kazimierz" },
      { type: "text", value: "." },
    ]);
  });

  it("leaves unmatched markers and HTML as literal text", () => {
    expect(parseInline("2 * 3 = 6 <b>x</b>")).toEqual([{ type: "text", value: "2 * 3 = 6 <b>x</b>" }]);
  });
});

describe("parseRichText", () => {
  it("groups paragraphs and lists", () => {
    const blocks = parseRichText("It's sunny in Kraków.\n\nTry these:\n1. **Wawel** castle\n2. Planty park\n\n- bring water\n* wear a hat");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "paragraph", "list", "list"]);
    expect(blocks[2]).toMatchObject({ type: "list", ordered: true, start: 1 });
    expect(blocks[3]).toMatchObject({ type: "list", ordered: false });
  });

  it("keeps the starting number of an ordered list", () => {
    expect(parseRichText("3. Third\n4. Fourth")[0]).toMatchObject({ ordered: true, start: 3 });
  });

  it("keeps single line breaks inside a paragraph", () => {
    const [block] = parseRichText("Line one\r\nLine two");
    expect(block).toMatchObject({ type: "paragraph" });
    expect(block.type === "paragraph" && block.lines).toHaveLength(2);
  });

  it("turns markdown headings into heading blocks", () => {
    expect(parseRichText("## Day 1\nMorning walk")[0]).toEqual({
      type: "heading",
      content: [{ type: "text", value: "Day 1" }],
    });
  });

  it("returns nothing for blank input", () => {
    expect(parseRichText("  \n\n ")).toEqual([]);
  });
});
