/**
 * Minimal Markdown renderer for notification bubbles.
 * Supports: **bold**, *italic*, `inline code`, ```code blocks```,
 *           [links](url), and - list items.
 * HTML is escaped first for XSS safety.
 */

function renderMarkdown(text) {
  if (!text) return '';

  // 1. Escape HTML entities (XSS protection)
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // 2. Code blocks: ```lang\ncode\n``` (must be before inline transforms)
  text = text.replace(/```(?:\w*)\n?([\s\S]*?)```/g, (_, code) => {
    return `<pre class="md-code-block"><code>${code.trim()}</code></pre>`;
  });

  // 3. Inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // 4. Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 5. Italic: *text* (but not inside already-processed tags)
  text = text.replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '<em>$1</em>');

  // 6. Links: [text](https://url) — only http/https allowed
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a class="md-link" data-href="$2">$1</a>');

  // 7. Lists: lines starting with "- " → wrap in <ul>
  text = text.replace(/((?:^|\n)- .+(?:\n- .+)*)/g, (block) => {
    const items = block.trim().split('\n').map(line => {
      const content = line.replace(/^- /, '');
      return `<li class="md-list-item">${content}</li>`;
    }).join('');
    return `<ul class="md-list">${items}</ul>`;
  });

  // 8. Newlines → <br> (but not inside <pre> blocks)
  // Split around <pre>...</pre>, only convert \n in non-pre segments
  const parts = text.split(/(<pre class="md-code-block">[\s\S]*?<\/pre>)/);
  text = parts.map(part => {
    if (part.startsWith('<pre')) return part;
    return part.replace(/\n/g, '<br>');
  }).join('');

  return text;
}
