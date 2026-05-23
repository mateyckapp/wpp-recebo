interface ApiMethodProps {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  description?: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-brand-600/20 text-brand-400 border-brand-500/30',
  POST: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  PATCH: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
  PUT: 'bg-violet-600/20 text-violet-400 border-violet-500/30',
  DELETE: 'bg-red-600/20 text-red-400 border-red-500/30',
};

export function ApiMethod({ method, path, description }: ApiMethodProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 my-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border ${METHOD_COLORS[method]}`}>
          {method}
        </span>
        <code className="font-mono text-sm text-white">{path}</code>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}

interface ParamRowProps {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

export function ParamTable({ params }: { params: ParamRowProps[] }) {
  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.03]">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parâmetro</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Obrigatório</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={p.name} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
              <td className="px-4 py-3 font-mono text-xs text-brand-400">{p.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.type}</td>
              <td className="px-4 py-3 text-xs">
                {p.required ? (
                  <span className="text-red-400 font-semibold">Sim</span>
                ) : (
                  <span className="text-gray-600">Não</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AlertProps {
  type: 'info' | 'warning' | 'danger' | 'success';
  children: React.ReactNode;
}

const ALERT_STYLES: Record<string, string> = {
  info: 'border-brand-500/25 bg-brand-600/5 text-brand-300',
  warning: 'border-amber-500/25 bg-amber-600/5 text-amber-300',
  danger: 'border-red-500/25 bg-red-600/5 text-red-300',
  success: 'border-emerald-500/25 bg-emerald-600/5 text-emerald-300',
};

const ALERT_ICONS: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🚫',
  success: '✅',
};

export function Alert({ type, children }: AlertProps) {
  return (
    <div className={`rounded-lg border p-4 my-4 flex gap-3 ${ALERT_STYLES[type]}`}>
      <span className="text-base flex-shrink-0 mt-0.5">{ALERT_ICONS[type]}</span>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
