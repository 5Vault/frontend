import Logo from "../../assets/logow.png";
import useAuthContext from "../../hook/useAuthContext";
import Icons from "../../utils/Icons";
import DashButton from "../DashButton";

// interface SelectOption {
//   value: string;
//   label: string;
// }

const Top = () => {

  const { user } = useAuthContext();

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

      <span className="flex items-center gap-2">
        {!user ? (
          <>
            <DashButton
              label="Login"
              onClick={() => {
                window.location.href = "/account/?mode=login";
              }}
            />
            <button
              className="text-zinc-200 py-2 px-4 rounded-lg bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] hover:bg-[var(--primary-contrast-light)] transition-colors"
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

export default Top;
