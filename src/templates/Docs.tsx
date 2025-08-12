import HomeTop from "../components/HomeTop";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";

// Register the language before using SyntaxHighlighter

const luaCode = `
local uploadURL = "https://liberty-storage.onrender.com/"
exports['screenshot']:requestScreenshotUpload(uploadURL, 'file',
function(data)
  local response = json.decode(data)
  if response and response.url then
    callback(true, response.url)
  else
    callback(false, "Falha ao processar o upload.")
  end
end)
`;

const useCode = `
UploadScreenshotClient(function(success, url)
    if success then
        print(url)
    else
        print("Failed to upload screenshot")
    end
end)
`;

const DocsTemplate = () => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-screen">
      <HomeTop />
      <h1>Documentation</h1>
      <p>This is the documentation for the 5Vault application.</p>
      <div className="w-full max-w-2xl px-4 py-6">
        <SyntaxHighlighter language="lua" style={style} showLineNumbers>
          {luaCode}
        </SyntaxHighlighter>
        <SyntaxHighlighter language="lua" style={style} showLineNumbers>
          {useCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default DocsTemplate;
