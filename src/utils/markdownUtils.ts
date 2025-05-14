/**
 * Utility functions for rendering markdown content
 */

/**
 * Enhanced markdown renderer that converts markdown syntax to HTML
 * while removing empty lines and making content more condensed
 *
 * @param markdown The markdown string to render
 * @returns HTML string
 */
export const renderMarkdown = (markdown: string): string => {
  if (!markdown) return '';

  // Simple escape function to prevent XSS
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Pre-process the markdown to remove consecutive empty lines
  // Replace 3 or more newlines with just 2 newlines (one paragraph break)
  let processedMarkdown = markdown.replace(/\n{3,}/g, '\n\n');

  // Escape the markdown
  let escapedMarkdown = escapeHtml(processedMarkdown);

  // Split into lines for processing
  const lines = escapedMarkdown.split('\n');
  const processedLines = [];
  let currentParagraph = '';
  let inList = false;
  let listItems = [];

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines that aren't paragraph breaks
    if (line === '') {
      // If we have a paragraph in progress, add it
      if (currentParagraph !== '') {
        processedLines.push(`<p>${currentParagraph}</p>`);
        currentParagraph = '';
      }

      // If we're in a list, finish it
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }

      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      // Flush any current paragraph
      if (currentParagraph !== '') {
        processedLines.push(`<p>${currentParagraph}</p>`);
        currentParagraph = '';
      }

      // Finish any list
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }

      processedLines.push(`<h3>${line.substring(4)}</h3>`);
    } else if (line.startsWith('## ')) {
      // Flush any current paragraph
      if (currentParagraph !== '') {
        processedLines.push(`<p>${currentParagraph}</p>`);
        currentParagraph = '';
      }

      // Finish any list
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }

      processedLines.push(`<h2>${line.substring(3)}</h2>`);
    } else if (line.startsWith('# ')) {
      // Flush any current paragraph
      if (currentParagraph !== '') {
        processedLines.push(`<p>${currentParagraph}</p>`);
        currentParagraph = '';
      }

      // Finish any list
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }

      processedLines.push(`<h1>${line.substring(2)}</h1>`);
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Flush any current paragraph
      if (currentParagraph !== '') {
        processedLines.push(`<p>${currentParagraph}</p>`);
        currentParagraph = '';
      }

      // Start or continue a list
      inList = true;
      listItems.push(`<li>${line.substring(2)}</li>`);
    }
    // Regular paragraph content
    else {
      // If we're in a list, finish it before starting a paragraph
      if (inList && listItems.length > 0) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }

      // Accumulate paragraph content
      if (currentParagraph !== '') {
        currentParagraph += ' ' + line;
      } else {
        currentParagraph = line;
      }
    }
  }

  // Add any remaining paragraph
  if (currentParagraph !== '') {
    processedLines.push(`<p>${currentParagraph}</p>`);
  }

  // Finish any remaining list
  if (inList && listItems.length > 0) {
    processedLines.push(`<ul>${listItems.join('')}</ul>`);
  }

  // Join processed elements
  let html = processedLines.join('');

  // Handle bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\_\_([^_]+)\_\_/g, '<strong>$1</strong>');
  html = html.replace(/\_([^_]+)\_/g, '<em>$1</em>');

  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Handle links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
};

/**
 * Creates a React-compatible dangerouslySetInnerHTML object
 *
 * @param markdown The markdown string to render
 * @returns Object with __html property containing rendered HTML
 */
export const createMarkdownHtml = (markdown: string): { __html: string } => {
  return { __html: renderMarkdown(markdown) };
};
