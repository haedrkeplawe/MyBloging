import { useState } from "react";
import MainURL from "../MainURL";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loaing, setLoaing] = useState(false);

  async function register(ev) {
    ev.preventDefault();
    if (!username || !password) {
      return toast.error("Please fill username and password");
    }
    setLoaing(true);
    const response = await fetch(MainURL + "/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (response.status === 200) {
      toast.success("register successful");
    } else {
      toast.error(data);
    }
    setLoaing(false);
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button disabled={loaing}>
        {loaing ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterPage;
