"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaRegEye, FaRegEyeSlash, FaRegUser } from "react-icons/fa6";

const REMEMBER_KEY = "remembered-username";

function getDeviceId() {
  if (typeof window === "undefined") return "anonymous-device";

  const existing = window.localStorage.getItem("rpg-device-id");
  if (existing) return existing;

  const created = window.crypto?.randomUUID?.() ?? `device-${Date.now()}`;
  window.localStorage.setItem("rpg-device-id", created);
  return created;
}

export default function Login() {
  const [onUsername, setOnUsername] = useState(false);
  const [onPassword, setOnPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const [deviceId, setDeviceId] = useState("anonymous-device");

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    async function loadRememberedUser() {
      try {
        const response = await fetch(`/api/settings/${REMEMBER_KEY}`, {
          method: "GET",
          headers: {
            "x-device-id": id,
          },
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        if (data?.value) {
          setUsername(data.value);
          setRememberMe(true);
        }
      } catch {
        // Sem bloqueio de UI em caso de falha de rede.
      }
    }

    loadRememberedUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await fetch(`/api/settings/${REMEMBER_KEY}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
        body: JSON.stringify({
          value: rememberMe && username.trim() ? username.trim() : null,
        }),
      });
    } catch {
      // Se falhar, segue fluxo de login normalmente.
    }

    router.push("/home");
  };

  return (
    <div className="flex flex-col w-full gap-4 p-3 m-auto mx-4 border rounded-md shadow-md md:mx-auto md:w-1/2 border-slate-300">
      <h1 className="text-3xl font-bold text-center">Bem-vindo!</h1>
      <p className="text-center text-slate-500">
        Faça login para acessar a sua conta
      </p>
      <form
        onSubmit={handleLogin}
        className="flex flex-col w-full gap-10 px-4 mx-auto sm:w-1/2 sm:px-0"
      >
        <div className="flex flex-col">
          <label htmlFor="username" className="text-lg text-slate-500">
            Nome / E-mail
          </label>
          <div
            className={`flex transition translate-x-0 border-b-2 ${
              onUsername ? "border-b-primary" : "border-b-slate-500"
            }`}
          >
            <input
              id="username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setOnUsername(true)}
              onBlur={() => setOnUsername(false)}
              className="flex-1 w-full focus:outline-none text-slate-600"
            />
            <span>
              <FaRegUser className="fill-slate-500" />
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="text-lg text-slate-500">
            Senha
          </label>
          <div
            className={`flex transition translate-x-0 border-b-2 ${
              onPassword ? "border-b-primary" : "border-b-slate-500"
            }`}
          >
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              onFocus={() => setOnPassword(true)}
              onBlur={() => setOnPassword(false)}
              className="flex-1 w-full focus:outline-none text-slate-600"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="transition cursor-pointer"
            >
              {showPassword ? (
                <FaRegEyeSlash className="w-8 fill-slate-500" />
              ) : (
                <FaRegEye className="w-8 fill-slate-500" />
              )}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2 ">
            <input
              id="remember"
              type="checkbox"
              className="w-5 h-5 my-auto "
              name="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" className="my-auto text-slate-500">
              Lembrar de mim?
            </label>
          </div>
          <Link
            href="/reset-pass"
            className="transition text-primary hover:text-primaryHover hover:drop-shadow-md"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full p-2 text-xl font-bold text-white transition rounded-md bg-primary hover:bg-primaryHover hover:shadow-md"
        >
          Login
        </button>
      </form>
    </div>
  );
}
