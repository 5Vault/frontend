import {
  Children,
  createContext,
  type ReactElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import type { SelectorItemProps } from "./SelectorItem";

export type SelectorContextValue = {
  selectedValue: SelectorItemProps["value"] | null;
  onSelect: (value: SelectorItemProps["value"]) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SelectorContext = createContext<SelectorContextValue | null>(null);

type SelectorProps = {
  placeholder?: string;
  width?: string;
  value: SelectorItemProps["value"] | null;
  onChange: (value: SelectorItemProps["value"]) => void;
  children:
    | ReactElement<SelectorItemProps>
    | Array<ReactElement<SelectorItemProps>>;
  className?: string; // Optional custom classes for the trigger
  containerClassName?: string; // Optional custom classes for the container
};

const Selector = ({
  placeholder,
  width,
  value,
  onChange,
  children,
  className,
  containerClassName,
}: SelectorProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setCoords(null);
  }, []);

  const handleOpen = () => {
    updateCoords();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleUpdate = () => {
      updateCoords();
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        const portal = document.getElementById("selector-portal");
        if (portal && portal.contains(target)) return;
        closeMenu();
      }
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, updateCoords, closeMenu]);

  const contextValue = useMemo(
    () => ({
      selectedValue: value,
      onSelect: (nextValue: SelectorItemProps["value"]) => {
        onChange(nextValue);
        closeMenu();
      },
    }),
    [onChange, value, closeMenu],
  );

  const getOptionLabel = (child: ReactElement<SelectorItemProps>): string | null => {
    if (typeof child.props.label === "string" && child.props.label.trim().length > 0) {
      return child.props.label;
    }
    const kids = child.props.children;
    if (typeof kids === "string" || typeof kids === "number") {
      return String(kids);
    }
    if (Array.isArray(kids)) {
      const joined = kids
        .map(k => (typeof k === "string" || typeof k === "number") ? String(k) : "")
        .join("")
        .trim();
      if (joined) return joined;
    }
    return null;
  };

  const selectedLabel = useMemo(() => {
    for (const child of Children.toArray(children)) {
      if (
        isValidElement<SelectorItemProps>(child) &&
        child.props.value === value
      ) {
        return getOptionLabel(child);
      }
    }
    return null;
  }, [children, value]);

  return (
    <SelectorContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`relative ${width ? width : "w-full"} ${containerClassName || ""}`}
      >
        {/* Trigger */}
        <div
          onClick={handleOpen}
          className={`
            h-10 w-full flex items-center justify-between px-4 rounded-xl border transition-colors duration-200
            ${open
              ? "bg-zinc-800 border-zinc-600"
              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            }
            cursor-pointer group ${className || ""}
          `}
        >
          <span className={`text-sm transition-colors ${selectedLabel ? "text-white" : "text-zinc-500"}`}>
            {selectedLabel ?? placeholder ?? "Selecione uma opção"}
          </span>

          <div className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <svg
              width="10" height="6" viewBox="0 0 12 8"
              fill="none" xmlns="http://www.w3.org/2000/svg"
              className={`transition-colors ${open ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-400"}`}
            >
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Dropdown Menu using Portal */}
        {open &&
          coords &&
          createPortal(
            <div
              id="selector-portal"
              className="fixed z-[9999] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
              style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
            >
              <div className="mt-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-xl shadow-black/60 overflow-hidden">
                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {children}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </SelectorContext.Provider>
  );
};

export default Selector;
