import { Fragment, type ReactNode } from "react";

// Lightweight renderer for assistant text: linkifies URLs and email addresses,
// turns "- " lines into a real list, and preserves fenced code blocks. Kept
// deliberately small — a full markdown pipeline would be more than the model's
// output format needs, and more surface area to sanitise.

const LINK_PATTERN = /(https?:\/\/[^\s<>()]+|mailto:[^\s<>()]+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b)/g;

function trimTrailingPunctuation(url: string): { href: string; trailing: string } {
  const match = url.match(/[.,;:!?]+$/);
  if (!match) return { href: url, trailing: "" };
  return { href: url.slice(0, -match[0].length), trailing: match[0] };
}

function linkify(text: string, keyPrefix: string): ReactNode[] {
  return text.split(LINK_PATTERN).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;

    const isLink = index % 2 === 1;
    if (!isLink) return <Fragment key={key}>{part}</Fragment>;

    const { href, trailing } = trimTrailingPunctuation(part);
    const isEmail = href.startsWith("mailto:") || !href.startsWith("http");
    const resolved = isEmail && !href.startsWith("mailto:") ? `mailto:${href}` : href;
    const label = href.replace(/^mailto:/, "");

    return (
      <Fragment key={key}>
        <a
          href={resolved}
          target={isEmail ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:no-underline break-words"
        >
          {label}
        </a>
        {trailing}
      </Fragment>
    );
  });
}

/** Groups consecutive "- " lines into a single <ul>, leaving other lines as paragraphs. */
function renderBlock(block: string, keyPrefix: string): ReactNode[] {
  const lines = block.split("\n");
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (at: number) => {
    if (bullets.length === 0) return;
    nodes.push(
      <ul key={`${keyPrefix}-ul-${at}`} className="my-2 space-y-1 list-disc list-outside ml-4">
        {bullets.map((item, i) => (
          <li key={i}>{linkify(item, `${keyPrefix}-li-${at}-${i}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.replace(/^#{1,6}\s*/, "");
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);

    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }

    flushBullets(index);

    if (line.trim() === "") {
      nodes.push(<div key={`${keyPrefix}-sp-${index}`} className="h-2" />);
      return;
    }

    nodes.push(
      <p key={`${keyPrefix}-p-${index}`} className="leading-relaxed">
        {linkify(line, `${keyPrefix}-t-${index}`)}
      </p>,
    );
  });

  flushBullets(lines.length);
  return nodes;
}

export function MessageText({ content }: { content: string }) {
  if (!content) return null;

  const segments = content.split(/```/);

  return (
    <div className="text-sm break-words">
      {segments.map((segment, index) =>
        index % 2 === 1 ? (
          <pre key={`code-${index}`} className="my-2 rounded bg-muted p-3 overflow-x-auto">
            <code className="text-xs">{segment.replace(/^\w*\n/, "")}</code>
          </pre>
        ) : (
          <Fragment key={`text-${index}`}>{renderBlock(segment, `s${index}`)}</Fragment>
        ),
      )}
    </div>
  );
}
