import type { ReactElement } from "react";

type DashButtonProps = {
    icon?: ReactElement;
    label: string;
    onClick: () => void;
}

const DashButton = (props: DashButtonProps) => {
    return (
        <button 
            onClick={props.onClick} 
            className="relative flex items-center gap-2 p-2 rounded-md text-zinc-600 hover:text-zinc-400 transition-colors overflow-hidden group bg-transparent hover:bg-zinc-800/70"
        >
            {props.icon}
            <span>{props.label}</span>
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--primary-contrast-light)] transition-all duration-1000 group-hover:w-full" />
        </button>
    );
}

export default DashButton;