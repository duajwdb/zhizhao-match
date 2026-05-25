import { Fragment } from 'react'

interface MarkdownReportProps {
  content: string
  className?: string
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'paragraph' | 'list-item' | 'bold-list-item' | 'divider' | 'code' | 'bold-text'
  content: string
  items?: string[]
}

function parseMarkdown(md: string): Block[] {
  const lines = md.split('\n')
  const blocks: Block[] = []
  let listItems: string[] = []
  let listType: 'list-item' | 'bold-list-item' | null = null

  function flushList() {
    if (listItems.length > 0 && listType) {
      blocks.push({ type: listType, content: '', items: [...listItems] })
      listItems = []
      listType = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '---') {
      flushList()
      blocks.push({ type: 'divider', content: '' })
      continue
    }

    if (trimmed.startsWith('#### ')) {
      flushList()
      blocks.push({ type: 'h4', content: trimmed.replace('#### ', '') })
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      blocks.push({ type: 'h3', content: trimmed.replace('### ', '') })
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushList()
      blocks.push({ type: 'h2', content: trimmed.replace('## ', '') })
      continue
    }

    if (trimmed.startsWith('# ')) {
      flushList()
      blocks.push({ type: 'h1', content: trimmed.replace('# ', '') })
      continue
    }

    if (trimmed.startsWith('```')) {
      flushList()
      continue
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)/)
    if (listMatch) {
      const itemContent = listMatch[1]
      const isBold = itemContent.startsWith('**') && itemContent.includes('：')
      const newListType = isBold ? 'bold-list-item' : 'list-item'

      if (listType !== newListType) {
        flushList()
        listType = newListType
      }
      listItems.push(itemContent)
      continue
    }

    flushList()

    if (trimmed && trimmed.startsWith('**') && !trimmed.startsWith('**') === false) {
      blocks.push({ type: 'bold-text', content: trimmed })
      continue
    }

    if (trimmed) {
      blocks.push({ type: 'paragraph', content: trimmed })
    }
  }

  flushList()
  return blocks
}

function formatInline(text: string): (string | { bold: string })[] {
  const parts: (string | { bold: string })[] = []
  const regex = /\*\*(.*?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push({ bold: match[1] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function InlineText({ text }: { text: string }) {
  const parts = formatInline(text)
  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return <Fragment key={i}>{part}</Fragment>
        }
        return (
          <strong key={i} className="text-white font-heading font-semibold">
            {part.bold}
          </strong>
        )
      })}
    </>
  )
}

export default function MarkdownReport({ content, className = '' }: MarkdownReportProps) {
  const blocks = parseMarkdown(content)

  return (
    <div className={`prose-custom ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={i} className="text-xl font-display text-white mb-4 mt-2">
                <InlineText text={block.content} />
              </h1>
            )
          case 'h2':
            return (
              <h2 key={i} className="text-lg font-heading font-bold text-white mt-8 mb-3 pb-2 border-b border-white/5">
                <InlineText text={block.content} />
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="text-base font-heading font-semibold text-tech-300 mt-6 mb-3">
                <InlineText text={block.content} />
              </h3>
            )
          case 'h4':
            return (
              <h4 key={i} className="text-sm font-heading font-semibold text-slate-300 mt-4 mb-2">
                <InlineText text={block.content} />
              </h4>
            )
          case 'paragraph':
            return (
              <p key={i} className="text-sm text-slate-400 leading-relaxed mb-3">
                <InlineText text={block.content} />
              </p>
            )
          case 'bold-text':
            return (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-2 font-medium">
                <InlineText text={block.content} />
              </p>
            )
          case 'bold-list-item':
            return (
              <ul key={i} className="space-y-3 mb-4">
                {block.items?.map((item, j) => {
                  const colonIdx = item.indexOf('：')
                  const label = colonIdx > 0 ? item.slice(0, colonIdx).replace(/\*\*/g, '') : item
                  const value = colonIdx > 0 ? item.slice(colonIdx + 1) : ''

                  return (
                    <li key={j} className="flex gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-tech-400 mt-2 flex-shrink-0" />
                      <div>
                        <span className="text-white font-heading font-semibold">
                          <InlineText text={label} />：
                        </span>
                        <span className="text-slate-400">
                          <InlineText text={value} />
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )
          case 'list-item':
            return (
              <ul key={i} className="space-y-1.5 mb-4">
                {block.items?.map((item, j) => (
                  <li key={j} className="flex gap-2 text-sm text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
                    <InlineText text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'divider':
            return <hr key={i} className="my-6 border-white/5" />
          case 'code':
            return (
              <pre key={i} className="bg-white/[0.03] rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto mb-4 border border-white/5">
                {block.content}
              </pre>
            )
          default:
            return null
        }
      })}
    </div>
  )
}