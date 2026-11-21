import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function MarkdownViewer({ content = '' }) {
  const sanitizedHtml = useMemo(() => {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: true
    });

    const rawHtml = marked.parse(content || '');
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  return (
    <div
      className="markdown-body text-slate-200"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
