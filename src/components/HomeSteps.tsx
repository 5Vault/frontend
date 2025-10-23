import { useState } from "react";
import Icons from "../utils/Icons";

const steps = [
    {
        title: "Create an Account",
        description: "Sign up on our platform to get started with secure file storage.",
        icon: Icons.account
    },
    {
        title: "Configure Your Server",
        description: "Set up your server settings to optimize performance and security.",
        icon: Icons.configure
    },
    {
        title: "Upload Your Files",
        description: "Easily upload and manage your files in a secure environment.",
        icon: Icons.folder
    }
]


const HomeSteps = () => {
    const [step, setStep] = useState<0 | 1 | 2 >(0);

    return (
        <div className="mb-16">
            <h2 className="text-xl font-bold mb-8">How it works ?</h2>
            <div className="flex justify-center">
                <span className="flex flex-col">                    
                    {Array.from(steps).map((_, index) => (
                        <button 
                            key={index}
                            style={{ borderRadius: 0 }}
                            className={`w-52 h-full relative overflow-hidden
                                ${step === index ? "bg-[var(--primary-contrast-light)]" : "bg-zinc-900/50"}
                                border-1 border-zinc-100/10 hover:bg-[var(--primary-contrast-light)] transition-colors first:rounded-tl-lg last:rounded-bl-lg`}
                            onClick={() => setStep((index) as 0 | 1 | 2)}
                        > 
                        <span className="absolute inset-0 flex items-center justify-center">
                            step {index + 1}
                        </span>
                        <span className="absolute top-0 -left-4 text-8xl font-bold opacity-50">{index + 1}</span>
                        </button>
                    ))}
                </span>
                <div className="flex flex-col items-center justify-center p-4 border border-zinc-100/10 shadow-md rounded-lg bg-zinc-900/50 w-96 h-72 border-l-0 rounded-l-none">
                    <div className="p-4 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] rounded-2xl flex items-center justify-center mb-4">
                        {steps[step].icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{steps[step].title}</h3>
                    <p className="text-zinc-400 text-center max-w-md">{steps[step].description}</p>
                </div>
            </div>
        </div>  
    )
};

export default HomeSteps;