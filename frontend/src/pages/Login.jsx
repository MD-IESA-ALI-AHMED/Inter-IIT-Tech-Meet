import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const navigate = useNavigate();

  const doLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/register`, {
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      // auto-login
      const loginRes = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/login`, {
        email: regEmail,
        password: regPassword,
      });
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));
      navigate("/");
    } catch (err) {
      setRegError(err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="w-[90%] sm:w-[80%] md:max-w-2/3 lg:max-w-1/2 mx-auto  sm:flex border rounded-lg overflow-hidden shadow-lg bg-zinc-800">
        <div className="sm:w-1/2  flex justify-center items-center bg-zinc-400 p-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/IIT_Kharagpur_Logo.svg/250px-IIT_Kharagpur_Logo.svg.png"
            alt="IIT KGP"
            className="w-1/2"
          />
        </div>
        <div className="sm:w-1/2 relative h-[500px]">
          <form
            onSubmit={doLogin}
            className={`absolute inset-0 bg-zinc-800 p-8 rounded-xl shadow-lg space-y-6 flex flex-col justify-center transition-all duration-300 ease-in-out ${
              showRegister
                ? "opacity-0 -translate-x-6 pointer-events-none"
                : "opacity-100 translate-x-0 pointer-events-auto"
            }`}
            aria-hidden={showRegister}
          >
            <h2 className="text-3xl font-bold text-center text-gray-200">
              Welcome Back
            </h2>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-200"
              >
                Email
              </label>
              <input
                id="email"
                placeholder="alice@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none text-white placeholder:text-zinc-400 "
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-200"
              >
                Password
              </label>
              <div className="flex justify-center items-center gap-1 relative">
                <input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-zinc-200 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none"
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer h-4 w-4 absolute right-3 top-[40%]"
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer  w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-sm font-semibold cursor-pointer text-gray-200 hover:underline"
              >
                New here? Register yourself by clicking here
              </button>
            </div>
          </form>

          <form
            onSubmit={doRegister}
            className={`absolute inset-0 bg-zinc-800 p-8 rounded-xl shadow-lg space-y-4 transition-all duration-300 ease-in-out ${
              showRegister
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 translate-x-6 pointer-events-none"
            }`}
            aria-hidden={!showRegister}
          >
            <h3 className="text-3xl  text-zinc-200 font-bold text-center">Register Here</h3>
            <div>
              <label className="text-sm font-medium text-gray-200">Name</label>
              <input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Alice"
                className="mt-1 w-full px-4 py-2 border border-zinc-200 placeholder:text-zinc-400 outline-none  rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-200">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alice@example.com"
                className="mt-1 w-full px-4 py-2 border border-zinc-200 placeholder:text-zinc-400 outline-none rounded-lg text-white"
                required
              />
            </div>
            <div className="flex justify-center items-center gap-1 relative">
              <input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-zinc-200 placeholder:text-zinc-400 rounded-lg outline-none  text-white"
                required
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer h-4 w-4 absolute right-3 top-[40%]"
              >
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </div>
            </div>
            {regError && <div className="text-sm text-red-600">{regError}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={regLoading}
                className="bg-green-600 w-full cursor-pointer hover:bg-green-500 transition text-white px-4 py-2 rounded-lg"
              >
                {regLoading ? "Creating..." : "Register"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-sm font-semibold cursor-pointer text-zinc-200 hover:underline"
              >
                Already have an account with us? Click here to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
