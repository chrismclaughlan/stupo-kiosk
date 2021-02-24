import { useState } from "react";

const Login = ({ setError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch("/api/session/login", {
      method: "post",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else console.log("Logged in!");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <input
          required
          type="text"
          placeholder="Email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          required
          minLength="8"
          maxLength="30"
          type="password"
          placeholder="Password (min 8)"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
