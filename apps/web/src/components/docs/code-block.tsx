interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'json', title }: CodeBlockProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0f] overflow-hidden my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="text-xs text-gray-500 font-mono">{title}</span>
          <span className="text-xs text-gray-700 font-mono uppercase tracking-wider">{language}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
        <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

interface InlineCodeProps {
  children: React.ReactNode;
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="font-mono text-xs bg-white/[0.06] border border-white/[0.08] text-brand-400 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}
