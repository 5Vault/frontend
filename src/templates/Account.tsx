import { useEffect, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

const AccountTemplate = () => {
  // In your component:
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const modes = {
    login: <Login />,
    register: <Register />,
    recovery: <Recovery />,
  };

  useEffect(() => {
    if (mode !== "login" && mode !== "register" && mode !== "recovery") {
      // Redirect to login if mode is not set or invalid
      window.location.href = "/account/?mode=login";
    }
  }, [mode]);

  const validMode = mode && mode in modes ? mode as keyof typeof modes : null;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <div className="h-fit w-112 border border-zinc-100/10 rounded-lg p-6 flex flex-col items-center justify-start">
        {validMode != null ? modes[validMode] : <Login />}
      </div>
    </div>
  );
};

const Login = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center">Login 5Vault</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start mt-6 gap-2"
      >
        <label className="text-sm text-zinc-400 mb-2">Username</label>
        <input
          type="text"
          placeholder="Username"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <label className="text-sm text-zinc-400 mb-2">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
      <div className="flex justify-between w-full mt-4">
        <a href="/account/?mode=register" className="text-sm text-zinc-400">
          Don't have an account?
        </a>
        <a href="/account/?mode=recovery" className="text-sm text-zinc-400">
          Forgot your password?
        </a>
      </div>
    </div>
  );
};

const Register = () => {
  return (
    <div>
      <h2>Register</h2>
      <form>
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

const Recovery = () => {
  return (
    <div>
      <h2>Recover Account</h2>
      <form>
        <input type="email" placeholder="Email" />
        <button type="submit">Send Recovery Email</button>
      </form>
    </div>
  );
};

export default AccountTemplate;
