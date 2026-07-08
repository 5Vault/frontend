import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Registre-se gratuitamente e acesse o painel em segundos.",
    code: `// Acesse 5keepr.app e clique em "Criar conta"
// Nenhum cartão de crédito necessário no plano gratuito`,
  },
  {
    number: "02",
    title: "Configure seu storage",
    description: "Configure para outros domínios ou use subdomínio 5Keepr.",
    code: `// Painel → Storage → Novo Storage
domain_type: "shared"  // ou "own"
custom_domain: "assets.meuservidor.com"`,
  },
  {
    number: "03",
    title: "Gere sua API Key",
    description: "Crie uma chave de API para autenticar seus uploads.",
    code: `// Painel → API Keys → Gerar chave
API_KEY="fv_live_xxxxxxxxxxxxxxxx"`,
  },
  {
    number: "04",
    title: "Faça upload dos assets",
    description: "Envie texturas, modelos e sons diretamente pelo painel ou API.",
    code: `curl -X POST https://api.5keepr.app/v1/files \\
  -H "Api-Key: fv_live_xxx" \\
  -F "file=@texture.ytd"`,
  },
];

const Steps = () => {
  const [active, setActive] = useState(0);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Como funciona</h2>
      <p className="text-zinc-500 text-sm mb-8">Configure seu storage em menos de 5 minutos.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === i
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                active === i
                  ? "bg-[var(--primary-contrast-light)] text-white"
                  : "bg-zinc-700 text-zinc-400"
              }`}
            >
              {s.number}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="font-semibold text-white">{steps[active].title}</h3>
          <p className="text-zinc-500 text-sm mt-1">{steps[active].description}</p>
        </div>
        <pre className="bg-[#0d0d0e] px-6 py-5 text-sm text-zinc-300 font-mono overflow-x-auto">
          {steps[active].code}
        </pre>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-4 justify-center">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              active === i ? "bg-[var(--primary-contrast-light)] w-4" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Steps;
