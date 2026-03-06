interface Props {
  message: string;
}

function renderInlineMarkdown(text: string) {
  return text.replace(
    /`([^`]+)`/g,
    '<code style="background:rgba(var(--accent-rgb),0.12);font-family:\'SF Mono\',\'Fira Code\',monospace;font-size:14px;padding:2px 7px;border-radius:5px;color:var(--accent-light)">$1</code>'
  );
}

export default function BubbleMessage({ message }: Props) {
  return (
    <div
      className="text-base leading-relaxed font-[450]"
      style={{ color: 'var(--card-text)' }}
      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(message) }}
    />
  );
}
