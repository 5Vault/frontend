import { useState } from "react";
import { Check, Copy, Code2, ChevronRight, BookOpen, FileCode } from "lucide-react";
import HeaderTemplate from "../components/Header";
import useAuthContext from "../hook/useAuthContext";

const BASE_URL = "https://api.5vault.com.br/api/v1";

type Platform = "fivem" | "roblox";

// ── Script files ──────────────────────────────────────────────────────────────

type ScriptFile = {
  name: string;
  lang: string;
  code: string;
};

const fivemFiles = (apiKey: string, bucketId: string): ScriptFile[] => [
  {
    name: "fxmanifest.lua",
    lang: "lua",
    code: `fx_version 'cerulean'
game 'gta5'

name '5vault'
description '5Vault SDK — armazenamento de arquivos para FiveM'
version '1.0.0'
author '5Vault'

server_scripts {
    'config.lua',
    'server.lua',
}`,
  },
  {
    name: "config.lua",
    lang: "lua",
    code: `Config = {}

Config.ApiKey   = "${apiKey}"
Config.BucketId = "${bucketId}"
Config.DirId    = "seu_diretorio_id"   -- ID do diretório dentro do bucket
Config.BaseUrl  = "${BASE_URL}"`,
  },
  {
    name: "server.lua",
    lang: "lua",
    code: `-- 5Vault SDK — server.lua
-- Todos os exports devem ser chamados server-side.
-- Uso em outro resource: exports['5vault']:UploadFile(...)

local _boundary = "----5VaultBoundary" .. tostring(math.random(100000, 999999))

--- Constrói o body multipart/form-data a partir de um arquivo lido com LoadResourceFile.
--- @param fileName  string  Nome do arquivo (com extensão)
--- @param fileData  string  Conteúdo binário do arquivo
--- @param mimeType  string  MIME type (ex: "image/png", "application/json")
local function buildMultipart(fileName, fileData, mimeType)
    local b = _boundary
    return table.concat({
        "--" .. b,
        ('Content-Disposition: form-data; name="file"; filename="%s"'):format(fileName),
        ("Content-Type: %s"):format(mimeType or "application/octet-stream"),
        "",
        fileData,
        "--" .. b .. "--",
        "",
    }, "\\r\\n")
end

--- Envia um arquivo do disco (dentro do resource) para o bucket configurado.
--- @param fileName  string    Nome do arquivo a enviar (deve estar na pasta do resource)
--- @param mimeType  string    MIME type do arquivo
--- @param callback  function  function(ok: boolean, url: string|nil)
exports('UploadFile', function(fileName, mimeType, callback)
    local data = LoadResourceFile(GetCurrentResourceName(), fileName)
    if not data then
        print("[5Vault] Arquivo não encontrado: " .. tostring(fileName))
        return callback(false, nil)
    end

    local body = buildMultipart(fileName, data, mimeType)

    PerformHttpRequest(
        ("%s/bucket/%s/dir/%s/files"):format(Config.BaseUrl, Config.BucketId, Config.DirId),
        function(status, responseBody)
            if status == 200 or status == 201 then
                local result = json.decode(responseBody)
                callback(true, result and result.url)
            else
                print(("[5Vault] Erro no upload (%d): %s"):format(status, tostring(responseBody)))
                callback(false, nil)
            end
        end,
        "POST",
        body,
        {
            ["Content-Type"] = "multipart/form-data; boundary=" .. _boundary,
            ["API-Key"]      = Config.ApiKey,
        }
    )
end)

--- Envia dados brutos (string/binário) como arquivo para o bucket.
--- Útil para salvar JSON, texto ou qualquer dado gerado em runtime.
--- @param fileName  string    Nome do arquivo de destino
--- @param rawData   string    Conteúdo do arquivo
--- @param mimeType  string    MIME type
--- @param callback  function  function(ok: boolean, url: string|nil)
exports('UploadRaw', function(fileName, rawData, mimeType, callback)
    local body = buildMultipart(fileName, rawData, mimeType)

    PerformHttpRequest(
        ("%s/bucket/%s/dir/%s/files"):format(Config.BaseUrl, Config.BucketId, Config.DirId),
        function(status, responseBody)
            if status == 200 or status == 201 then
                local result = json.decode(responseBody)
                callback(true, result and result.url)
            else
                print(("[5Vault] Erro no upload (%d): %s"):format(status, tostring(responseBody)))
                callback(false, nil)
            end
        end,
        "POST",
        body,
        {
            ["Content-Type"] = "multipart/form-data; boundary=" .. _boundary,
            ["API-Key"]      = Config.ApiKey,
        }
    )
end)

--- Lista todos os arquivos do diretório configurado.
--- @param callback  function  function(files: table|nil)
exports('ListFiles', function(callback)
    PerformHttpRequest(
        ("%s/bucket/%s/dir/%s/files"):format(Config.BaseUrl, Config.BucketId, Config.DirId),
        function(status, responseBody)
            if status == 200 then
                callback(json.decode(responseBody))
            else
                print(("[5Vault] Erro ao listar arquivos (%d)"):format(status))
                callback(nil)
            end
        end,
        "GET",
        "",
        { ["API-Key"] = Config.ApiKey }
    )
end)

--- Deleta um arquivo do bucket pelo nome.
--- @param fileName  string    Nome do arquivo
--- @param callback  function  function(ok: boolean)
exports('DeleteFile', function(fileName, callback)
    PerformHttpRequest(
        ("%s/bucket/%s/dir/%s/files/%s"):format(Config.BaseUrl, Config.BucketId, Config.DirId, fileName),
        function(status)
            if status == 204 then
                callback(true)
            else
                print(("[5Vault] Erro ao deletar '%s' (%d)"):format(fileName, status))
                callback(false)
            end
        end,
        "DELETE",
        "",
        { ["API-Key"] = Config.ApiKey }
    )
end)

print("[5Vault] SDK carregado.")`
  },
  {
    name: "uso.lua",
    lang: "lua",
    code: `-- Exemplo de uso em outro resource (server-side)
-- Certifique-se que '5vault' está listado em dependencies no seu fxmanifest.lua

-- Salvar dados de um jogador como JSON
RegisterNetEvent('meuResource:salvarJogador', function(data)
    local src    = source
    local conteudo = json.encode(data)

    exports['5vault']:UploadRaw(
        ("jogador_%d.json"):format(src),
        conteudo,
        "application/json",
        function(ok, url)
            if ok then
                print(("[5Vault] Salvo: %s"):format(url))
            end
        end
    )
end)

-- Upload de um arquivo local do resource
exports['5vault']:UploadFile("banner.png", "image/png", function(ok, url)
    if ok then
        print("[5Vault] Banner enviado: " .. url)
    end
end)

-- Listar arquivos
exports['5vault']:ListFiles(function(files)
    if not files then return end
    for _, f in ipairs(files) do
        print(f.name .. " — " .. f.url)
    end
end)

-- Deletar arquivo
exports['5vault']:DeleteFile("jogador_123.json", function(ok)
    if ok then print("[5Vault] Arquivo removido.") end
end)`,
  },
];

const robloxFiles = (apiKey: string, bucketId: string): ScriptFile[] => [
  {
    name: "FiveVaultConfig.lua",
    lang: "lua",
    code: `-- ModuleScript em ServerScriptService
local Config = {}

Config.ApiKey   = "${apiKey}"
Config.BucketId = "${bucketId}"
Config.DirId    = "seu_diretorio_id"
Config.BaseUrl  = "${BASE_URL}"

return Config`,
  },
  {
    name: "FiveVaultService.lua",
    lang: "lua",
    code: `-- ModuleScript em ServerScriptService
-- Habilite HTTP Requests em: Game Settings → Security → Allow HTTP Requests

local HttpService = game:GetService("HttpService")
local Config = require(script.Parent.FiveVaultConfig)

local FiveVault = {}

local function filesUrl(fileName)
    local base = ("%s/bucket/%s/dir/%s/files"):format(Config.BaseUrl, Config.BucketId, Config.DirId)
    if fileName then return base .. "/" .. fileName end
    return base
end

--- Envia dados brutos como arquivo para o bucket via form multipart.
--- @param fileName  string   Nome do arquivo de destino (ex: "dados.json")
--- @param rawData   string   Conteúdo do arquivo
--- @param mimeType  string   MIME type (ex: "application/json", "image/png")
--- @return boolean, string?
function FiveVault.UploadRaw(fileName: string, rawData: string, mimeType: string): (boolean, string?)
    local boundary = "----5VaultBoundary" .. tostring(math.random(100000, 999999))
    local body = table.concat({
        "--" .. boundary,
        ('Content-Disposition: form-data; name="file"; filename="%s"'):format(fileName),
        ("Content-Type: %s"):format(mimeType or "application/octet-stream"),
        "",
        rawData,
        "--" .. boundary .. "--",
        "",
    }, "\\r\\n")

    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url    = filesUrl(),
            Method = "POST",
            Headers = {
                ["Content-Type"] = "multipart/form-data; boundary=" .. boundary,
                ["API-Key"]      = Config.ApiKey,
            },
            Body = body,
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

--- Lista todos os arquivos do diretório configurado.
--- @return table?
function FiveVault.ListFiles(): {any}?
    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url     = filesUrl(),
            Method  = "GET",
            Headers = { ["API-Key"] = Config.ApiKey },
        })
    end)

    if ok and result.Success then
        return HttpService:JSONDecode(result.Body)
    else
        warn("[5Vault] Erro ao listar:", result)
        return nil
    end
end

--- Remove um arquivo pelo nome.
--- @param fileName string
--- @return boolean
function FiveVault.DeleteFile(fileName: string): boolean
    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url     = filesUrl(fileName),
            Method  = "DELETE",
            Headers = { ["API-Key"] = Config.ApiKey },
        })
    end)

    if ok and result.StatusCode == 204 then
        return true
    else
        warn("[5Vault] Erro ao deletar:", result)
        return false
    end
end

return FiveVault`,
  },
  {
    name: "uso.lua",
    lang: "lua",
    code: `-- Script (server) de exemplo
local FiveVault = require(game.ServerScriptService.FiveVaultService)

-- Salvar dados de um jogador como JSON
game.Players.PlayerRemoving:Connect(function(player)
    local dados = {
        nome = player.Name,
        userId = player.UserId,
        saiu = os.time(),
    }

    local json = game:GetService("HttpService"):JSONEncode(dados)
    local ok, url = FiveVault.UploadRaw(
        ("jogador_%d.json"):format(player.UserId),
        json,
        "application/json"
    )

    if ok then
        print("[5Vault] Salvo: " .. url)
    end
end)

-- Listar arquivos
local files = FiveVault.ListFiles()
for _, f in ipairs(files or {}) do
    print(f.name .. " — " .. f.url)
end

-- Deletar arquivo
local removido = FiveVault.DeleteFile("jogador_123.json")
if removido then print("[5Vault] Removido.") end`,
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

// ── Main ─────────────────────────────────────────────────────────────────────

const FiveMIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const RobloxIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M5.37 0L0 17.36 13.23 21 18.63 3.64zm9.95 12.05l-4.17-1.17 1.17-4.17 4.17 1.17z"/>
  </svg>
);

const SDKTemplate = () => {
  const { user } = useAuthContext();
  const [platform, setPlatform] = useState<Platform>("fivem");
  const [activeFile, setActiveFile] = useState(0);

  const apiKey   = user?.api_key ?? "SUA_API_KEY";
  const bucketId = "SEU_BUCKET_ID";
  const files    = platform === "fivem" ? fivemFiles(apiKey, bucketId) : robloxFiles(apiKey, bucketId);
  const current  = files[activeFile];

  const handlePlatform = (p: Platform) => { setPlatform(p); setActiveFile(0); };

  const fivemExports = [
    { name: "UploadFile(fileName, mimeType, callback)",   desc: "Envia um arquivo local do resource via form multipart" },
    { name: "UploadRaw(fileName, rawData, mimeType, cb)", desc: "Envia dados gerados em runtime (JSON, texto, binário)" },
    { name: "ListFiles(callback)",                         desc: "Lista todos os arquivos do diretório configurado" },
    { name: "DeleteFile(fileName, callback)",              desc: "Remove um arquivo pelo nome" },
  ];

  const robloxMethods = [
    { name: "FiveVault.UploadRaw(fileName, rawData, mimeType)", desc: "Envia dados via form multipart. Retorna (ok, url)" },
    { name: "FiveVault.ListFiles()",                             desc: "Lista arquivos do diretório. Retorna table?" },
    { name: "FiveVault.DeleteFile(fileName)",                    desc: "Remove um arquivo. Retorna boolean" },
  ];

  const infoFiveM = (
    <>
      Copie os 4 arquivos para uma pasta chamada{" "}
      <code className="text-[var(--primary-contrast-light)] bg-zinc-800 px-1 rounded">5vault</code> dentro de{" "}
      <code className="text-zinc-300 bg-zinc-800 px-1 rounded">resources/</code> e adicione{" "}
      <code className="text-zinc-300 bg-zinc-800 px-1 rounded">ensure 5vault</code> no{" "}
      <code className="text-zinc-300 bg-zinc-800 px-1 rounded">server.cfg</code>. Todos os exports são <strong className="text-white">server-side</strong>.
    </>
  );

  const infoRoblox = (
    <>
      Crie os ModuleScripts em <code className="text-zinc-300 bg-zinc-800 px-1 rounded">ServerScriptService</code> e habilite{" "}
      <strong className="text-white">Allow HTTP Requests</strong> em Game Settings → Security. Use apenas em <strong className="text-white">Scripts server-side</strong>.
    </>
  );

  return (
    <div className="flex flex-col w-full h-full gap-5 overflow-y-auto pr-1 pb-4">
      <HeaderTemplate
        icon={<Code2 size={22} />}
        title="SDKs"
        description="Scripts prontos para integrar o 5Vault ao seu jogo"
      />

      {/* Platform selector */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { id: "fivem" as Platform,  label: "FiveM",  icon: <FiveMIcon />,  color: "bg-orange-500/10 border-orange-500/30 text-orange-400", desc: "Resource Lua com exports para servidores FiveM" },
          { id: "roblox" as Platform, label: "Roblox", icon: <RobloxIcon />, color: "bg-red-500/10 border-red-500/30 text-red-400",           desc: "ModuleScripts Lua para jogos Roblox" },
        ]).map(p => (
          <button key={p.id} onClick={() => handlePlatform(p.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              platform === p.id ? p.color + " shadow-lg" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}>
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
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-white font-medium">Sua API Key está pré-preenchida.</span>{" "}
          {platform === "fivem" ? infoFiveM : infoRoblox}
        </p>
      </div>

      {/* File tabs + code */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/80 overflow-x-auto">
          {files.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActiveFile(i)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono whitespace-nowrap border-r border-zinc-800 transition-colors ${
                activeFile === i
                  ? "bg-zinc-950 text-white border-b-2 border-b-[var(--primary-contrast-light)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <FileCode size={12} />
              {f.name}
            </button>
          ))}
        </div>

        {/* Code */}
        <div className="relative bg-zinc-950">
          <div className="flex justify-end px-3 py-1.5 border-b border-zinc-800/60">
            <CopyButton text={current.code} />
          </div>
          <pre className="px-5 py-5 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono max-h-[520px] overflow-y-auto">
            <code>{current.code}</code>
          </pre>
        </div>
      </div>

      {/* API reference */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <ChevronRight size={14} className="text-[var(--primary-contrast-light)]" />
          {platform === "fivem" ? "Exports disponíveis" : "Métodos disponíveis"}
        </h3>
        <div className="flex flex-col gap-2">
          {(platform === "fivem" ? fivemExports : robloxMethods).map(e => (
            <div key={e.name} className="flex items-start gap-3 text-xs">
              <code className="text-[var(--primary-contrast-light)] bg-zinc-800 px-2 py-1 rounded font-mono shrink-0">{e.name}</code>
              <span className="text-zinc-500 pt-1">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SDKTemplate;
