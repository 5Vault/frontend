import { useState, useEffect } from "react";
import { Check, Copy, Code2, ChevronRight, BookOpen, FileCode, Download, Loader2 } from "lucide-react";
import HeaderTemplate from "../components/Header";
import useAuthContext from "../hook/useAuthContext";
import useAxios from "../utils/axiosConfig";
import toast from "react-hot-toast";
import Selector from "../components/Selector";
import SelectorItem from "../components/SelectorItem";

const createZip = (files: { name: string; content: string }[]): Blob => {
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  const getCrc32 = (data: Uint8Array): number => {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
  };

  const textEncoder = new TextEncoder();
  const fileDataList = files.map(f => {
    const nameBytes = textEncoder.encode(f.name);
    const contentBytes = textEncoder.encode(f.content);
    const crc = getCrc32(contentBytes);
    return {
      name: f.name,
      nameBytes,
      contentBytes,
      crc,
      size: contentBytes.length,
    };
  });

  const buffers: Uint8Array[] = [];
  const localOffsets: number[] = [];
  let currentOffset = 0;

  for (const file of fileDataList) {
    localOffsets.push(currentOffset);
    const header = new ArrayBuffer(30 + file.nameBytes.length);
    const view = new DataView(header);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 10, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, file.crc, true);
    view.setUint32(18, file.size, true);
    view.setUint32(22, file.size, true);
    view.setUint16(26, file.nameBytes.length, true);
    view.setUint16(28, 0, true);
    
    new Uint8Array(header, 30).set(file.nameBytes);

    const headerArray = new Uint8Array(header);
    buffers.push(headerArray);
    buffers.push(file.contentBytes);

    currentOffset += headerArray.length + file.size;
  }

  const centralDirStartOffset = currentOffset;
  let centralDirSize = 0;

  for (let i = 0; i < fileDataList.length; i++) {
    const file = fileDataList[i];
    const offset = localOffsets[i];
    const cdHeader = new ArrayBuffer(46 + file.nameBytes.length);
    const view = new DataView(cdHeader);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 10, true);
    view.setUint16(6, 10, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, file.crc, true);
    view.setUint32(20, file.size, true);
    view.setUint32(24, file.size, true);
    view.setUint16(28, file.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, offset, true);

    new Uint8Array(cdHeader, 46).set(file.nameBytes);

    const cdHeaderArray = new Uint8Array(cdHeader);
    buffers.push(cdHeaderArray);
    centralDirSize += cdHeaderArray.length;
    currentOffset += cdHeaderArray.length;
  }

  const eocd = new ArrayBuffer(22);
  const view = new DataView(eocd);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileDataList.length, true);
  view.setUint16(10, fileDataList.length, true);
  view.setUint32(12, centralDirSize, true);
  view.setUint32(16, centralDirStartOffset, true);
  view.setUint16(20, 0, true);

  buffers.push(new Uint8Array(eocd));

  return new Blob(buffers, { type: "application/zip" });
};

const BASE_URL = "https://api.sexdaily.app/api/v1";

type Platform = "fivem" | "roblox";

// ── Script files ──────────────────────────────────────────────────────────────

type ScriptFile = {
  name: string;
  lang: string;
  code: string;
};

const fivemFiles = (apiKey: string, bucketId: string, bucketUrl: string): ScriptFile[] => [
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
    'backup.lua',
}`,
  },
  {
    name: "config.lua",
    lang: "lua",
    code: `Config = {}

Config.ApiKey    = "${apiKey}"
Config.BucketId  = "${bucketId}"
Config.BaseUrl   = "${BASE_URL}"
Config.BucketUrl = "${bucketUrl || "-- URL pública do bucket (configure em Armazenamento)"}"

-- Backup automático
Config.BackupApiKey   = Config.ApiKey  -- use uma key dedicada se quiser
Config.BackupHours    = { 2, 8, 14, 20 }  -- horários UTC-3 para rodar o backup (4x/dia = enterprise)
Config.BackupImageDir = "cel_img"          -- pasta com backup_index.json`,
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
--- @param fileName  string    Nome do arquivo a enviar (deve estar na pasta do resource, ex: "imagens/foto.png")
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
        ("%s/bucket/%s/upload?force_create=true"):format(Config.BaseUrl, Config.BucketId),
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
--- @param fileName  string    Nome do arquivo de destino (ex: "logs/registro.txt")
--- @param rawData   string    Conteúdo do arquivo
--- @param mimeType  string    MIME type
--- @param callback  function  function(ok: boolean, url: string|nil)
exports('UploadRaw', function(fileName, rawData, mimeType, callback)
    local body = buildMultipart(fileName, rawData, mimeType)

    PerformHttpRequest(
        ("%s/bucket/%s/upload?force_create=true"):format(Config.BaseUrl, Config.BucketId),
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

--- Lista arquivos de um diretório específico do bucket.
--- @param dirName   string    Nome do diretório (opcional)
--- @param callback  function  function(files: table|nil)
exports('ListFiles', function(dirName, callback)
    if type(dirName) == "function" then
        callback = dirName
        dirName = ""
    end

    PerformHttpRequest(
        ("%s/bucket/%s/files?dir=%s"):format(Config.BaseUrl, Config.BucketId, dirName or ""),
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

--- Deleta um arquivo do bucket pelo nome (ex: "imagens/foto.png").
--- @param fileName  string    Nome do arquivo completo
--- @param callback  function  function(ok: boolean)
exports('DeleteFile', function(fileName, callback)
    PerformHttpRequest(
        ("%s/bucket/%s/files?filename=%s"):format(Config.BaseUrl, Config.BucketId, fileName),
        function(status)
            if status == 204 or status == 200 then
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

-- Salvar dados de um jogador como JSON dentro da pasta "jogadores"
RegisterNetEvent('meuResource:salvarJogador', function(data)
    local src    = source
    local conteudo = json.encode(data)

    exports['5vault']:UploadRaw(
        ("jogadores/jogador_%d.json"):format(src),
        conteudo,
        "application/json",
        function(ok, url)
            if ok then
                print(("[5Vault] Salvo: %s"):format(url))
            end
        end
    )
end)

-- Upload de um arquivo local para a pasta "banners"
exports['5vault']:UploadFile("banners/banner.png", "image/png", function(ok, url)
    if ok then
        print("[5Vault] Banner enviado: " .. url)
    end
end)

-- Listar arquivos da pasta "jogadores"
exports['5vault']:ListFiles("jogadores", function(res)
    if not res or not res.files then return end
    for _, f in ipairs(res.files) do
        print(f.key .. " — " .. f.public_url)
    end
end)

-- Deletar arquivo
exports['5vault']:DeleteFile("jogadores/jogador_123.json", function(ok)
    if ok then print("[5Vault] Arquivo removido.") end
end)`,
  },
  {
    name: "backup.lua",
    lang: "lua",
    code: `-- 5Vault Backup — backup.lua
-- Faz backup automático de imagens e dados SQL nos horários configurados.
-- Adicione 'backup.lua' em server_scripts no fxmanifest.lua.

local _sessionId = nil
local _boundary  = "----5VaultBackup" .. tostring(math.random(100000, 999999))

local function buildMultipart(filePath, fileData, mimeType)
    local b = _boundary
    local pathField   = ("--" .. b .. "\\r\\nContent-Disposition: form-data; name=\\"path\\"\\r\\n\\r\\n" .. filePath .. "\\r\\n")
    local sessionField = _sessionId and ("--" .. b .. "\\r\\nContent-Disposition: form-data; name=\\"session_id\\"\\r\\n\\r\\n" .. _sessionId .. "\\r\\n") or ""
    local fileHeader  = ("--" .. b .. "\\r\\nContent-Disposition: form-data; name=\\"file\\"; filename=\\"%s\\"\\r\\nContent-Type: %s\\r\\n\\r\\n"):format(
        filePath:match("[^/]+$") or filePath, mimeType or "application/octet-stream"
    )
    return pathField .. sessionField .. fileHeader .. fileData .. "\\r\\n--" .. b .. "--\\r\\n"
end

local function backupFile(filePath, fileData, mimeType, cb)
    PerformHttpRequest(
        ("%s/backup/file"):format(Config.BaseUrl),
        function(status, body)
            if status == 200 then
                local r = json.decode(body)
                if r and r.session_id then _sessionId = r.session_id end
                if cb then cb(true) end
            else
                print(("[5Vault Backup] Falha '%s' (%d): %s"):format(filePath, status, tostring(body)))
                if cb then cb(false) end
            end
        end,
        "POST",
        buildMultipart(filePath, fileData, mimeType),
        {
            ["Content-Type"] = "multipart/form-data; boundary=" .. _boundary,
            ["Api-Key"]      = Config.BackupApiKey or Config.ApiKey,
        }
    )
end

-- Backup de imagens: lê backup_index.json dentro do diretório configurado.
-- O arquivo deve conter: { "files": ["foto.png", "subpasta/outro.jpg"] }
local function backupImages()
    if not Config.BackupImageDir then return end
    local mimeMap = { png="image/png", jpg="image/jpeg", jpeg="image/jpeg", gif="image/gif", webp="image/webp" }
    local indexRaw = LoadResourceFile(GetCurrentResourceName(), Config.BackupImageDir .. "/backup_index.json")
    if not indexRaw then
        print("[5Vault Backup] Crie '" .. Config.BackupImageDir .. "/backup_index.json' com a lista de arquivos.")
        return
    end
    local idx = json.decode(indexRaw)
    if not idx or not idx.files then return end
    for _, f in ipairs(idx.files) do
        local fullPath = Config.BackupImageDir .. "/" .. f
        local data = LoadResourceFile(GetCurrentResourceName(), fullPath)
        if data then
            local ext = f:match("%.(%w+)$") or ""
            backupFile(fullPath, data, mimeMap[ext:lower()] or "application/octet-stream")
        end
    end
end

-- Backup do banco de dados. Implemente Config.BackupGetTables para exportar dados SQL.
-- Exemplo: Config.BackupGetTables = function(cb) cb({ {name="players", data="INSERT ..."} }) end
local function backupDatabase()
    if not Config.BackupGetTables then return end
    Config.BackupGetTables(function(tables)
        if not tables then return end
        for _, t in ipairs(tables) do
            if t.data and #t.data > 0 then
                backupFile(t.name .. ".sql", t.data, "application/sql")
            end
        end
    end)
end

local function runBackup()
    _sessionId = nil
    print("[5Vault Backup] Iniciando ciclo de backup...")
    backupImages()
    backupDatabase()
    print("[5Vault Backup] Arquivos enviados.")
end

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    if not Config.BackupHours or #Config.BackupHours == 0 then
        print("[5Vault Backup] Config.BackupHours vazio — backup automático desativado.")
        return
    end
    local lastRan = -1
    SetInterval(function()
        local h = tonumber(os.date("%H"))
        if h == lastRan then return end
        for _, bh in ipairs(Config.BackupHours) do
            if h == bh then lastRan = h; runBackup(); break end
        end
    end, 60000)
    print("[5Vault Backup] Agendado para: " .. table.concat(Config.BackupHours, "h, ") .. "h")
end)`,
  },
];

const robloxFiles = (apiKey: string, bucketId: string, bucketUrl: string): ScriptFile[] => [
  {
    name: "FiveVaultConfig.lua",
    lang: "lua",
    code: `-- ModuleScript em ServerScriptService
local Config = {}

Config.ApiKey    = "${apiKey}"
Config.BucketId  = "${bucketId}"
Config.BaseUrl   = "${BASE_URL}"
Config.BucketUrl = "${bucketUrl || "-- URL pública do bucket (configure em Armazenamento)"}"

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
    if fileName then 
        return ("%s/bucket/%s/files?filename=%s"):format(Config.BaseUrl, Config.BucketId, fileName)
    end
    return ("%s/bucket/%s/files"):format(Config.BaseUrl, Config.BucketId)
end

local function uploadUrl()
    return ("%s/bucket/%s/upload?force_create=true"):format(Config.BaseUrl, Config.BucketId)
end

--- Envia dados brutos como arquivo para o bucket via form multipart.
--- @param fileName  string   Nome do arquivo de destino (ex: "dados.json" ou "dir/dados.json")
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
            Url    = uploadUrl(),
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

--- Lista todos os arquivos de um diretório específico.
--- @param dirName string? (opcional)
--- @return table?
function FiveVault.ListFiles(dirName: string?): {any}?
    local url = filesUrl()
    if dirName and dirName ~= "" then
        url = url .. "?dir=" .. dirName
    end
    local ok, result = pcall(function()
        return HttpService:RequestAsync({
            Url     = url,
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

--- Remove um arquivo pelo nome (incluindo o caminho, ex: "dir/arquivo.jpg").
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

-- Salvar dados de um jogador como JSON na pasta "jogadores"
game.Players.PlayerRemoving:Connect(function(player)
    local dados = {
        nome = player.Name,
        userId = player.UserId,
        saiu = os.time(),
    }

    local json = game:GetService("HttpService"):JSONEncode(dados)
    local ok, url = FiveVault.UploadRaw(
        ("jogadores/jogador_%d.json"):format(player.UserId),
        json,
        "application/json"
    )

    if ok then
        print("[5Vault] Salvo: " .. url)
    end
end)

-- Listar arquivos da pasta "jogadores"
local res = FiveVault.ListFiles("jogadores")
if res and res.files then
    for _, f in ipairs(res.files) do
        print(f.key .. " — " .. f.public_url)
    end
end

-- Deletar arquivo
local removido = FiveVault.DeleteFile("jogadores/jogador_123.json")
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
  const axiosInstance = useAxios();
  const [platform, setPlatform] = useState<Platform>("fivem");
  const [activeFile, setActiveFile] = useState(0);

  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [buckets, setBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [keysRes, bucketsRes] = await Promise.all([
          axiosInstance.get("/key/"),
          axiosInstance.get("/bucket/"),
        ]);
        const fetchedKeys = keysRes.data ?? [];
        if (user?.api_key && !fetchedKeys.some((k: any) => k.key === user.api_key)) {
          fetchedKeys.unshift({
            id: 0,
            label: "Chave Padrão (Default)",
            key: user.api_key,
          });
        }
        setKeys(fetchedKeys);
        if (fetchedKeys.length > 0) {
          setSelectedKey(fetchedKeys[0].key);
        }
        const fetchedBuckets = bucketsRes.data ?? [];
        setBuckets(fetchedBuckets);
        if (fetchedBuckets.length > 0) {
          setSelectedBucket(fetchedBuckets[0].bucket_id);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do SDK:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosInstance, user]);

  const activeKey = selectedKey || user?.api_key || "SUA_API_KEY";
  const activeBucket = selectedBucket || "SEU_BUCKET_ID";
  const activeBucketObj = buckets.find((b) => b.bucket_id === selectedBucket);
  const bucketPublicUrl = activeBucketObj
    ? activeBucketObj.custom_domain
      ? `https://${activeBucketObj.custom_domain}`
      : activeBucketObj.public_domain
        ? `https://${activeBucketObj.public_domain}`
        : null
    : null;
  const files    = platform === "fivem" ? fivemFiles(activeKey, activeBucket, bucketPublicUrl ?? "") : robloxFiles(activeKey, activeBucket, bucketPublicUrl ?? "");
  const current  = files[activeFile];

  const handlePlatform = (p: Platform) => { setPlatform(p); setActiveFile(0); };

  const handleDownloadSDK = () => {
    const zipBlob = createZip(
      files.map(f => ({
        name: platform === "fivem" ? `5vault/${f.name}` : `FiveVault/${f.name}`,
        content: f.code,
      }))
    );

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = platform === "fivem" ? "5vault-sdk-fivem.zip" : "5vault-sdk-roblox.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("SDK baixado com sucesso!");
  };

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

      {/* SDK Configuration & Download */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-white">Baixar SDK Pré-configurado</h3>
          <p className="text-xs text-zinc-500">
            Selecione as credenciais desejadas para baixar o resource com a chave e o bucket correspondente já configurados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Key Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Chave de API</label>
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-500">
                <Loader2 size={12} className="animate-spin" /> Carregando chaves...
              </div>
            ) : keys.length === 0 ? (
              <div className="px-3 py-2 bg-zinc-800/50 border border-zinc-800 rounded-lg text-xs text-zinc-500">
                Nenhuma chave criada. Usando chave padrão.
              </div>
            ) : (
              <Selector
                value={selectedKey}
                onChange={(val) => setSelectedKey(val as string)}
                placeholder="Selecione uma chave"
              >
                {keys.map((k) => (
                  <SelectorItem key={k.id} value={k.key}>
                    {k.label || `Chave #${k.id}`} ({k.key.slice(0, 8)}...{k.key.slice(-4)})
                  </SelectorItem>
                ))}
              </Selector>
            )}
          </div>

          {/* Bucket Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Bucket de Destino</label>
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-500">
                <Loader2 size={12} className="animate-spin" /> Carregando buckets...
              </div>
            ) : buckets.length === 0 ? (
              <div className="px-3 py-2 bg-zinc-800/50 border border-zinc-800 rounded-lg text-xs text-zinc-500">
                Nenhum bucket encontrado.
              </div>
            ) : (
              <Selector
                value={selectedBucket}
                onChange={(val) => setSelectedBucket(val as string)}
                placeholder="Selecione um bucket"
              >
                {buckets.map((b) => (
                  <SelectorItem key={b.bucket_id} value={b.bucket_id}>
                    {b.name}
                  </SelectorItem>
                ))}
              </Selector>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadSDK}
            className="flex items-center justify-center gap-2 bg-[#e8073f] hover:bg-[#c8063a] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#e8073f20] hover:shadow-[#e8073f30] cursor-pointer"
          >
            <Download size={14} />
            Baixar SDK (.zip)
          </button>
        </div>

        {/* Bucket public URL */}
        {bucketPublicUrl && (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">URL pública do bucket</span>
              <span className="text-xs text-zinc-300 font-mono truncate">{bucketPublicUrl}</span>
            </div>
            <CopyButton text={bucketPublicUrl} />
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/20">
        <BookOpen size={16} className="text-[var(--primary-contrast-light)] shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-white font-medium">Sua API Key está pré-preenchida.</span>{" "}
          {platform === "fivem" ? infoFiveM : infoRoblox}
        </p>
      </div>

      {/* Grid para Código + Referência de API */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* File tabs + code */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden lg:col-span-2">
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
            <pre className="px-5 py-5 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono">
              <code>{current.code}</code>
            </pre>
          </div>
        </div>

        {/* API reference */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ChevronRight size={14} className="text-[var(--primary-contrast-light)]" />
            {platform === "fivem" ? "Exports disponíveis" : "Métodos disponíveis"}
          </h3>
          <div className="flex flex-col gap-2">
            {(platform === "fivem" ? fivemExports : robloxMethods).map(e => (
              <div key={e.name} className="flex flex-col gap-1 text-xs pb-2 border-b border-zinc-800 last:border-0 last:pb-0">
                <code className="text-[var(--primary-contrast-light)] bg-zinc-800 px-2 py-1 rounded font-mono break-all">{e.name}</code>
                <span className="text-zinc-500 pl-1">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKTemplate;
