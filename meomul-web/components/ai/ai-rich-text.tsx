import type { ReactNode } from "react";

/**
 * Renders the small subset of Markdown Meomul AI writes (paragraphs, bullet and numbered
 * lists, **bold**, short headings) as React elements. No HTML is ever injected.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part.length > 0)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={`${keyPrefix}-${index}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={`${keyPrefix}-${index}`}>{part}</span>
      ),
    );
}

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const HEADING = /^\s*#{1,4}\s+/;

type Run = { kind: "text" | "bullets" | "numbers"; lines: string[] };

/** Groups a block's lines into runs, so an intro line followed by a list renders as both. */
function toRuns(lines: string[]): Run[] {
  const runs: Run[] = [];
  for (const line of lines) {
    const kind: Run["kind"] = BULLET.test(line) ? "bullets" : NUMBERED.test(line) ? "numbers" : "text";
    const last = runs[runs.length - 1];
    if (last && last.kind === kind) last.lines.push(line);
    else runs.push({ kind, lines: [line] });
  }
  return runs;
}

export function AiRichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className="space-y-3">
      {blocks.flatMap((block, blockIndex) =>
        toRuns(block.split("\n").filter((line) => line.trim().length > 0)).map((run, runIndex) => {
          const key = `b${blockIndex}-${runIndex}`;
          if (run.kind === "bullets") {
            return (
              <ul key={key} className="space-y-1.5">
                {run.lines.map((line, index) => (
                  <li key={`${key}-${index}`} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-[0.72rem] size-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{renderInline(line.replace(BULLET, ""), `${key}-${index}`)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          if (run.kind === "numbers") {
            return (
              <ol key={key} className="list-decimal space-y-1.5 pl-5 marker:text-quiet">
                {run.lines.map((line, index) => (
                  <li key={`${key}-${index}`} className="pl-1">
                    {renderInline(line.replace(NUMBERED, ""), `${key}-${index}`)}
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <p key={key}>
              {run.lines.map((line, index) => (
                <span key={`${key}-${index}`}>
                  {index > 0 ? <br /> : null}
                  {HEADING.test(line) ? (
                    <strong className="font-semibold text-ink">{line.replace(HEADING, "")}</strong>
                  ) : (
                    renderInline(line, `${key}-${index}`)
                  )}
                </span>
              ))}
            </p>
          );
        }),
      )}
    </div>
  );
}
