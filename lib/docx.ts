import {
  AlignmentType,
  DeletedTextRun,
  Document,
  HeadingLevel,
  InsertedTextRun,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { EditState } from "./types";
import type { Segment } from "./redline";

type Kind = "plain" | "ins" | "del";
interface Token {
  text: string;
  kind: Kind;
}

// Flatten rendered segments into a flat token stream. Rejected edits collapse
// back to their original text; accepted/pending edits become ins/del tokens
// (word-level, mirroring the on-screen redline).
function tokenize(segments: Segment[], states: Record<string, EditState>): Token[] {
  const tokens: Token[] = [];
  for (const seg of segments) {
    if (seg.kind === "plain") {
      tokens.push({ text: seg.text, kind: "plain" });
      continue;
    }
    const status = states[seg.edit.id]?.status ?? seg.status;
    if (status === "rejected") {
      tokens.push({ text: seg.original, kind: "plain" });
      continue;
    }
    for (const part of seg.parts) {
      if (part.type === "same") tokens.push({ text: part.value, kind: "plain" });
      else if (part.type === "ins") tokens.push({ text: part.value, kind: "ins" });
      else tokens.push({ text: part.value, kind: "del" });
    }
  }
  return tokens;
}

export interface DocxOptions {
  author?: string;
  title?: string;
}

// Build a Word document where accepted/pending edits are real tracked changes
// (w:ins / w:del), so the recipient can accept or reject them natively in Word.
export async function buildRedlineDocx(
  segments: Segment[],
  states: Record<string, EditState>,
  opts: DocxOptions = {},
): Promise<Blob> {
  const author = opts.author || "Indemnification Clause Reviewer";
  const date = new Date().toISOString();
  const tokens = tokenize(segments, states);

  // Split the token stream into paragraphs on newlines, emitting the right run
  // type for each piece. A unique id per revision run is required by Word.
  let revisionId = 1;
  const paragraphs: Paragraph[] = [];
  let runs: (TextRun | InsertedTextRun | DeletedTextRun)[] = [];

  const flush = () => {
    paragraphs.push(new Paragraph({ children: runs }));
    runs = [];
  };

  for (const token of tokens) {
    const pieces = token.text.split("\n");
    pieces.forEach((piece, i) => {
      if (i > 0) flush();
      if (piece.length === 0) return;
      if (token.kind === "ins") {
        runs.push(new InsertedTextRun({ text: piece, id: revisionId++, author, date }));
      } else if (token.kind === "del") {
        runs.push(new DeletedTextRun({ text: piece, id: revisionId++, author, date }));
      } else {
        runs.push(new TextRun(piece));
      }
    });
  }
  flush();

  const children: Paragraph[] = [];
  if (opts.title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: opts.title, bold: true })],
      }),
    );
  }
  children.push(...paragraphs);

  const doc = new Document({
    creator: author,
    title: opts.title,
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}
