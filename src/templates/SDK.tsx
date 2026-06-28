import { useState } from "react";
import { Check, Copy, Code2, Download, ExternalLink, ChevronRight, BookOpen } from "lucide-react";
import HeaderTemplate from "../components/Header";
import useAuthContext from "../hook/useAuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "fivem" | "roblox";

type CodeExample = {
  title: string;
  description: string;
  code: string;
};

// ── Code snippets ─────────────────────────────────────────────────────────────

const BASE_URL = "https://api.5vault.com.br/api/v1";

const fivemExamples = (apiKey: string): CodeExample[] => [
  {
    title: "Configuração inicial",
    description: "Adicione ao topo do seu script. Substitua a API key e o bucket desejado.",
    code: `-- config.lua
Config = {}
Config.ApiKey    = "${apiKey}"
Config.BucketId  = "seu_bucket_id"
Config.BaseUrl   = "${BASE_URL}"`,
  },
  {
    title: "Fazer upload de um arquivo",
    description: "Envia um arquivo em base64 para o seu bucket.",
    code: `-- Exemplo: upload de screenshot
local function UploadFile(fileName, base64Data, callback)
    PerformHttpRequest(
        Config.BaseUrl .. "/bucket/" .. Config.BucketId .. "/files",
        function(status, body, headers)
            if status == 200 or status == 201 then
                local result = json.decode(body)
                callback(true, result.url)
            else
                print("[5Vault] Erro no upload: " .. tostring(status))
                callback(false, nil)
            end
        end,
        "POST",
        json.encode({
            file_name = fileName,
            data      = base64Data,
        }),
        {
            ["Content-Type"] = "application/json",
            ["API-Key"]      = Config.ApiKey,
        }
    )
end

-- Uso:
UploadFile("screenshot.png", base64String, function(ok, url)
    if ok then
        print("[5Vault] Upload concluído: " .. url)
    end
end)`,
  },
  {
    title: "Listar arquivos do bucket",
    description: "Retorna todos os arquivos do bucket configurado.",
    code: `local function ListFiles(callback)
    PerformHttpRequest(
        Config.BaseUrl .. "/bucket/" .. Config.BucketId .. "/files",
        function(status, body)
            if status == 200 then
                local files = json.decode(body)
                callback(files)
            else
                callback(nil)
            end
        end,
        "GET",
        "",
        {
            ["API-Key"] = Config.ApiKey,
        }
    )
end

-- Uso:
ListFiles(function(files)
    if not files then return end
    for _, file in ipairs(files) do
        print(file.name .. " — " .. file.url)
    end
end)`,
  },
  {
    title: "Deletar um arquivo",
    description: "Remove um arquivo do bucket pelo nome.",
    code: `local function DeleteFile(fileName, callback)
    PerformHttpRequest(
        Config.BaseUrl .. "/bucket/" .. Config.BucketId .. "/files/" .. fileName,
        function(status)
            callback(status == 204)
        end,
        "DELETE",
        "",
        {
            ["API-Key"] = Config.ApiKey,
        }
    )
end

-- Uso:
DeleteFile("screenshot.png", function(ok)
    if ok then
        print("[5Vault] Arquivo removido.")
    end
end)`,
  },
];

const robloxExamples = (apiKey: string): CodeExample[] => [
  {
    title: "Configuração inicial",
    description: "Crie um ModuleScript em ServerScriptService com as configurações.",
    code: `-- FiveVaultConfig (ModuleScript)
local Config = {}

Config.ApiKey   = "${apiKey}"
Config.BucketId = "seu_bucket_id"
Config.BaseUrl  = "${BASE_URL}"

return Config`,
  },
  {
    title: "Fazer upload de um arquivo",
    description: "Envia dados em base64 para o seu bucket. Requer HTTP Requests habilitado nas configurações do jogo.",
    code: `-- FiveVaultService (ModuleScript)
local HttpService = game:GetService("HttpService")
local Config = require(script.Parent.FiveVaultConfig)

local FiveVault = {}

function FiveVault.UploadFile(fileName: string, base64Data: string): (boolean, string?)
    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url    = Config.BaseUrl .. "/bucket/" .. Config.BucketId .. "/files",
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json",
                ["API-Key"]      = Config.ApiKey,
            },
            Body = HttpService:JSONEncode({
                file_name = fileName,
                data      = base64Data,
            }),
        })
    end)

    if ok and result.Success then
        local data = HttpService:JSONDecode(result.Body)
        return true, data.url
    else
        warn("[5Vault] Erro no upload:", result)
        return false, nil
    end
end

return FiveVault

-- Uso (em um Script):
-- local FiveVault = require(...)
-- local ok, url = FiveVault.UploadFile("imagem.png", base64String)`,
  },
  {
    title: "Listar arquivos do bucket",
    description: "Retorna a lista de arquivos disponíveis no bucket.",
    code: `function FiveVault.ListFiles(): {any}?
    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url    = Config.BaseUrl .. "/bucket/" .. Config.BucketId .. "/files",
            Method = "GET",
            Headers = {
                ["API-Key"] = Config.ApiKey,
            },
        })
    end)

    if ok and result.Success then
        return HttpService:JSONDecode(result.Body)
    else
        warn("[5Vault] Erro ao listar arquivos:", result)
        return nil
    end
end

-- Uso:
-- local files = FiveVault.ListFiles()
-- for _, file in ipairs(files or {}) do
--     print(file.name, file.url)
-- end`,
  },
  {
    title: "Deletar um arquivo",
    description: "Remove um arquivo do bucket pelo nome.",
    code: `function FiveVault.DeleteFile(fileName: string): boolean
    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url    = Config.BaseUrl .. "/bucket/" .. Config.BucketId .. "/files/" .. fileName,
            Method = "DELETE",
            Headers = {
                ["API-Key"] = Config.ApiKey,
            },
        })
    end)

    if ok and (result.StatusCode == 204) then
        return true
    else
        warn("[5Vault] Erro ao deletar:", result)
        return false
    end
end`,
  },
];

// ── Copy button ───────────────────────────────────────────────────────────────

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-zinc-700"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
};

// ── Code block ────────────────────────────────────────────────────────────────

const CodeBlock = ({ example }: { example: CodeExample }) => (
  <div className="rounded-xl border border-zinc-800 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
      <div>
        <span className="text-sm font-semibold text-white">{example.title}</span>
        <p className="text-xs text-zinc-500 mt-0.5">{example.description}</p>
      </div>
      <CopyButton text={example.code} />
    </div>
    <pre className="bg-zinc-950 p-4 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono">
      <code>{example.code}</code>
    </pre>
  </div>
);

// ── Platform tab ──────────────────────────────────────────────────────────────

const FiveMIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RobloxIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M5.37 0L0 17.36 13.23 21 18.63 3.64zm9.95 12.05l-4.17-1.17 1.17-4.17 4.17 1.17z"/>
  </svg>
);

// ── Main ─────────────────────────────────────────────────────────────────────

const SDKTemplate = () => {
  const { user } = useAuthContext();
  const [platform, setPlatform] = useState<Platform>("fivem");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const apiKey = user?.api_key ?? "SUA_API_KEY";
  const examples = platform === "fivem" ? fivemExamples(apiKey) : robloxExamples(apiKey);

  const platforms: { id: Platform; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: "fivem",
      label: "FiveM",
      icon: <FiveMIcon />,
      color: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      desc: "Scripts Lua para servidores FiveM (GTA V roleplay)",
    },
    {
      id: "roblox",
      label: "Roblox",
      icon: <RobloxIcon />,
      color: "bg-red-500/10 border-red-500/30 text-red-400",
      desc: "ModuleScripts Lua para jogos Roblox",
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-5 overflow-y-auto pr-1 pb-4">
      <HeaderTemplate
        icon={<Code2 size={22} />}
        title="SDKs"
        description="Integre o 5Vault ao seu jogo com os scripts prontos"
      />

      {/* Platform selector */}
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPlatform(p.id); setOpenIndex(0); }}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              platform === p.id
                ? p.color + " shadow-lg"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <span className={`p-2 rounded-lg border ${platform === p.id ? p.color : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
              {p.icon}
            </span>
            <div>
              <p className="font-semibold text-sm text-white">{p.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/20">
        <BookOpen size={16} className="text-[var(--primary-contrast-light)] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-white font-medium">Sua API Key está pré-preenchida nos exemplos.</span>
          {" "}Mantenha-a segura — não inclua em código client-side.
          {platform === "roblox" && (
            <span> No Roblox, use apenas em <strong className="text-white">ServerScripts</strong> e habilite HTTP Requests em <em>Game Settings → Security</em>.</span>
          )}
          {platform === "fivem" && (
            <span> No FiveM, os requests devem ser feitos do lado <strong className="text-white">server</strong>.</span>
          )}
        </div>
      </div>

      {/* Setup steps */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Download size={15} className="text-[var(--primary-contrast-light)]" />
          Instalação rápida
        </h3>
        <ol className="flex flex-col gap-3">
          {(platform === "fivem" ? [
            { step: "1", text: "Crie um resource no seu servidor FiveM (pasta em resources/)" },
            { step: "2", text: "Adicione os scripts abaixo aos arquivos do resource" },
            { step: "3", text: "No fxmanifest.lua adicione os scripts à lista server_scripts" },
            { step: "4", text: "Certifique-se que o resource está em ensure no server.cfg" },
          ] : [
            { step: "1", text: "Em Game Settings → Security, habilite Allow HTTP Requests" },
            { step: "2", text: "Crie um ModuleScript chamado FiveVaultConfig em ServerScriptService" },
            { step: "3", text: "Crie outro ModuleScript chamado FiveVaultService no mesmo lugar" },
            { step: "4", text: "Copie os exemplos abaixo para cada ModuleScript na ordem" },
          ]).map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3 text-xs text-zinc-400">
              <span className="w-5 h-5 rounded-full bg-[var(--primary-contrast-light)]/20 border border-[var(--primary-contrast-light)]/30 text-[var(--primary-contrast-light)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </div>

      {/* Code examples — accordion */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Code2 size={15} className="text-[var(--primary-contrast-light)]" />
          Exemplos de código
        </h3>

        {examples.map((ex, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-zinc-900/80 hover:bg-zinc-900 transition-colors text-left"
            >
              <div>
                <span className="text-sm font-semibold text-white">{ex.title}</span>
                <p className="text-xs text-zinc-500 mt-0.5">{ex.description}</p>
              </div>
              <ChevronRight
                size={16}
                className={`text-zinc-500 transition-transform shrink-0 ${openIndex === i ? "rotate-90" : ""}`}
              />
            </button>
            {openIndex === i && (
              <div className="border-t border-zinc-800">
                <div className="flex justify-end px-3 py-1.5 bg-zinc-950 border-b border-zinc-800">
                  <CopyButton text={ex.code} />
                </div>
                <pre className="bg-zinc-950 px-4 py-4 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono">
                  <code>{ex.code}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <ExternalLink size={12} />
        <span>Dúvidas? Acesse a documentação completa ou entre em contato pelo suporte.</span>
      </div>
    </div>
  );
};

export default SDKTemplate;
