import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import useAuthContext from "../hook/useAuthContext";
import toast from "react-hot-toast";
import HomeTop from "../components/HomeTop";
import axios from "axios";

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

  const validMode = mode && mode in modes ? (mode as keyof typeof modes) : null;

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen">
      <HomeTop />
      <div className="h-fit mt-68 w-112 border border-zinc-100/10 rounded-lg p-6 flex items-center justify-center">
        {validMode != null ? modes[validMode] : <Login />}
      </div>
    </div>
  );
};

const Login = () => {
  const { fetchUserData } = useAuthContext();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    console.log("Logging in:", credentials.username, credentials.password);
    if (!credentials.username || !credentials.password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    setLoading(true);
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/login/try", formData)
      .then((res) => res.data)
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          fetchUserData(data.token).then((userFetched) => {
            setLoading(false);
            if (userFetched) {
              window.location.href = "/dashboard";
            } else {
              toast.error("Erro ao buscar dados do usuário");
            }
          });
        } else {
          setLoading(false);
          toast.error("Token não recebido");
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error("Erro ao fazer login");
      });
  };

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center">Login</h2>
      <form className="flex flex-col items-start mt-6 gap-2">
        <label className="text-sm text-zinc-400 mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
          placeholder="Username"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <label className="text-sm text-zinc-400 mb-2">Password</label>
        <input
          type="password"
          name="password"
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          placeholder="Password"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Login"}
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle register logic here
  };

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center">Register</h2>
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
        <label className="text-sm text-zinc-400 mb-2">Nome</label>
        <input
          type="text"
          placeholder="Nome"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <label className="text-sm text-zinc-400 mb-2">Email</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <label className="text-sm text-zinc-400 mb-2">Phone</label>
        <input
          type="tel"
          placeholder="Phone"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <label className="text-sm text-zinc-400 mb-2">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <label className="text-sm text-zinc-400 mb-2">Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Register
        </button>
      </form>
      <div className="flex justify-between w-full mt-4">
        <a href="/account/?mode=login" className="text-sm text-zinc-400">
          Already have an account?
        </a>
        <a href="/account/?mode=recovery" className="text-sm text-zinc-400">
          Forgot your password?
        </a>
      </div>
    </div>
  );
};

const Recovery = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle recovery logic here
  };

  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center">Recover Account</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start mt-6 gap-2"
      >
        <label className="text-sm text-zinc-400 mb-2">Email</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg p-2 border border-zinc-200/10 bg-transparent"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Send Recovery Email
        </button>
      </form>
      <div className="flex justify-between w-full mt-4">
        <a href="/account/?mode=login" className="text-sm text-zinc-400">
          Back to login
        </a>
        <a href="/account/?mode=register" className="text-sm text-zinc-400">
          Need an account?
        </a>
      </div>
    </div>
  );
};

export default AccountTemplate;
