interface Props {
  message: string;
}

function renderInlineMarkdown(text: string) {
  return text.replace(
    /`([^`]+)`/g,
    '<code style="background:rgba(var(--accent-rgb),0.12);font-family:\'SF Mono\',\'Fira Code\',\'Cascadia Code\',monospace;font-size:10.5px;padding:1px 5px;border-radius:4px;color:var(--accent-light)">$1</code>'
  );
}

export default function BubbleMessage({ message }: Props) {
  return (
    <div
      style={{
        fontSize: '12px',
        lineHeight: 1.55,
        color: 'var(--card-text)',
        fontWeight: 450,
        wordWrap: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(message) }}
    />
  );
}
