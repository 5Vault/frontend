import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
const AccountTemplate = () => {
  // In your component:
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (mode !== "login" && mode !== "register") {
      // Redirect to login if mode is not set or invalid
      window.location.href = "/account/?mode=login";
    }
  }, [mode]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <div className="h-180 w-112 border border-zinc-100/10 rounded-lg p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Account</h1>
        <div className="mt-4">
          {mode === "login" && <Login />}
          {mode === "register" && <Register />}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <div>
      <h2>Login</h2>
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
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

export default AccountTemplate;
