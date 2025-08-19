import { useEffect, useRef, useState } from "react";
import Logo from "../assets/logow.png";
import Select, { type StylesConfig } from "react-select";
import useVisualContext from "../hook/useVisualContext";
import toast from "react-hot-toast";
import useAuthContext from "../hook/useAuthContext";
import Icons from "../utils/Icons";

interface SelectOption {
  value: string;
  label: string;
}

const HomeTop = () => {
  const links = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About Us",
      href: "/about-us",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

  const { user } = useAuthContext();
  const [settings, settingsSet] = useState<boolean>(false);
  const { setLanguage, language } = useVisualContext();
  const ref = useRef<HTMLDivElement>(null);

  const selectStyles: StylesConfig<SelectOption, false> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#27272a",
      borderColor: "#3f3f46",
      minHeight: "32px",
      fontSize: "14px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#27272a",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#3f3f46" : "#27272a",
      color: "#ffffff",
      fontSize: "14px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        settingsSet(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full h-24 flex justify-between py-4 px-10">
      <span className="flex items-center gap-2">
        <img
          src={Logo}
          alt="Logo"
          className="h-12 transition-transform duration-300 hover:scale-110 hover:rotate-3 cursor-pointer animate-pulse"
        />
        <span className="text-3xl font-bold">5Vault</span>
      </span>
      <nav className="flex items-center gap-4 relative">
        {links.map((link) => {
          // Corrigir comparação para destacar apenas o link ativo
          const currentPath = window.location.pathname.replace(/\/+$/, "");
          const linkPath = link.href.replace(/\/+$/, "");
          const isActive = currentPath === linkPath;
          return (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm hover:text-white transition-colors ${
                isActive ? "text-white" : "text-zinc-400"
              }`}
            >
              {link.label}
            </a>
          );
        })}
        <div
          className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          onClick={() => settingsSet(!settings)}
        >
          Settings
        </div>
        {settings && (
          <div
            className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg flex flex-col p-4"
            ref={ref}
          >
            <span>
              <p>Language</p>
              <Select<SelectOption>
                options={[
                  { value: "enUS", label: "English" },
                  { value: "ptBR", label: "Português - Brasil" },
                ]}
                styles={selectStyles}
                value={{
                  value: language,
                  label: language === "ptBR" ? "Português - Brasil" : "English",
                }}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    if (selectedOption.value === "ptBR") {
                      localStorage.setItem("language", "ptBR");
                      setLanguage("ptBR");
                    } else if (selectedOption.value === "enUS") {
                      localStorage.setItem("language", "enUS");
                      setLanguage("enUS");
                    } else {
                      toast.error("Invalid language selected");
                    }
                  }
                }}
              />
            </span>
            <span>
              <p>Theme</p>
              <Select<SelectOption>
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                styles={selectStyles}
              />
            </span>
          </div>
        )}
      </nav>
      <span className="flex items-center gap-2">
        {!user ? (
          <>
            <button
              className="border border-zinc-100/10 text-white py-2 px-4 rounded"
              onClick={() => {
                window.location.href = "/account/?mode=login";
              }}
            >
              Login
            </button>
            <button
              className="text-white py-2 px-4 rounded bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]"
              onClick={() => {
                window.location.href = "/account/?mode=register";
              }}
            >
              Register
            </button>
          </>
        ) : (
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="rounded-full h-fit w-fit bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] flex gap-2"
          >
            {Icons.dashboard}
            Dashboard
          </button>
        )}
      </span>
    </header>
  );
};

export default HomeTop;
