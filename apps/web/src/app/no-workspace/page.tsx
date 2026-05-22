export default function NoWorkspacePage(): React.ReactElement {
  const isDev = process.env['NODE_ENV'] === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Workspace não encontrado</h1>
        <p className="text-sm text-gray-500 mb-6">
          Para aceder à plataforma, usa o URL do teu workspace:
          <br />
          <span className="font-mono text-brand-600 text-xs">
            https://&lt;nome-empresa&gt;.wpprecebo.pt
          </span>
        </p>

        {isDev && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
            <p className="text-xs font-medium text-amber-800 mb-1">Modo de desenvolvimento</p>
            <p className="text-xs text-amber-700">
              Acede via subdomínio:
            </p>
            <a
              href="http://demo.localhost:3000"
              className="text-xs font-mono text-brand-600 hover:underline"
            >
              http://demo.localhost:3000
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
