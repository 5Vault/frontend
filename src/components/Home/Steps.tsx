import { useState } from "react";
import { CircleUser, CloudUpload, FileSliders } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";


const getData = `
curl --request GET
  --url /api/v1/file/<FILE_ID>    
`;

const postData = `
curl --request POST \
  --url /api/v1/file/upload \
  --header 'Api-Key: <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
	"mime_type": "image/jpeg",
	"data": <BLOB_DATA>
}'
`




const steps = [
    {
        title: "Create an Account",
        description: <div>Sign up on our platform for free, and get access to our file hosting services. No Credit Card Required!</div>,
        icon: <CircleUser size={26} />,
    },
    {
        title: "Configure Your Server",
        description: <div className="flex flex-col items-center justify-center w-full">
            Use our SDKs to easily set up or create it by yourself using our RESTAPI. You can use it in any game or project you want!
        <div className="w-full flex gap-2">
        <SyntaxHighlighter language="curl" style={style} showLineNumbers>
          {getData}
        </SyntaxHighlighter>
        <SyntaxHighlighter language="curl" style={style} showLineNumbers>
          {postData}
        </SyntaxHighlighter>
      </div>
        </div>,
        icon: <FileSliders size={26} />,
    },
    {
        title: "Upload Your Files",
        description: <div>Easily upload and manage your files in a secure environment. To get started, simply upload your files by dragging them through our intuitive interface.</div>,
        icon: <CloudUpload size={26} />
    }
]


const Steps = () => {
    const [step, setStep] = useState<0 | 1 | 2 >(0);

    return (
        <div className="mb-16">
            <h2 className="text-xl font-bold mb-8">How it works ?</h2>
            <div className="flex flex-col justify-center items-center">
                <span className="flex justify-center">                    
                    {Array.from(steps).map((_, index) => (
                        <button 
                            key={index}
                            className={`w-99 h-20 relative overflow-hidden
                                ${step !== index && "bg-zinc-900/50"}
                                border-1 border-zinc-100/10 
                                hover:bg-[var(--primary-contrast-light)] transition-colors
                                first:rounded-tl-lg first:border-r-0 last:rounded-tr-lg last:border-l-0 border-b-0
                                `}
                            onClick={() => setStep((index) as 0 | 1 | 2)}
                        > 
                            <span className="absolute inset-0 flex items-center justify-start p-4 gap-2">
                                <div className="p-2 flex items-center justify-center">
                                    {steps[index].icon}
                                </div>
                                <div className="flex flex-col justify-start items-start">
                                    <span className="font-bold">Step {index + 1}</span>
                                    <span className="text-sm text-zinc-400">{steps[index].title}</span>
                                </div>
                            </span>
                        
                        </button>
                    ))}
                </span>
                <div className="flex flex-col items-center justify-center p-4 border border-zinc-100/10 shadow-md rounded-lg bg-zinc-900/50 w-full h-72 border-t-none rounded-t-none">                    
                    <h3 className="font-bold text-lg mb-2">{steps[step].title}</h3>
                    <p className="text-zinc-400 text-center max-w-md">{steps[step].description}</p>
                </div>
            </div>
        </div>  
    )
};

export default Steps;