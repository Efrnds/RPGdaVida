"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaRegEye, FaRegEyeSlash, FaRegUser } from "react-icons/fa6";
import { getDeviceId } from "../lib/deviceId";

const REMEMBER_KEY = "remembered-username";

export default function Login() {
  const [onUsername, setOnUsername] = useState(false);
  const [onPassword, setOnPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const [deviceId, setDeviceId] = useState("anonymous-device");

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;
        const data = await response.json();
        if (data?.authenticated) {
          router.push("/home");
        }
      } catch {
        // fluxo segue para login
      }
    }

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
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim()) {
      setErrorMessage("Informe seu e-mail.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Informe sua senha.");
      return;
    }

    setIsSubmitting(true);

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

      const authResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username.trim(),
          password,
        }),
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({}));
        setErrorMessage(errorData?.error || "Login inválido.");
        return;
      }

      setSuccessMessage("Login realizado com sucesso.");
      router.push("/home");
    } catch {
      setErrorMessage("Falha de rede ao tentar logar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 p-3 m-auto mx-4 border rounded-md shadow-md md:mx-auto md:w-1/2 border-slate-300">
      <h1 className="text-3xl font-bold text-center">Bem-vindo!</h1>
      <p className="text-center text-slate-500">
        Faça login para acessar a sua conta
      </p>

      {errorMessage ? (
        <p className="p-2 text-sm text-red-700 bg-red-100 rounded-md">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="p-2 text-sm text-green-700 bg-green-100 rounded-md">
          {successMessage}
        </p>
      ) : null}

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          disabled={isSubmitting}
          className="w-full p-2 text-xl font-bold text-white transition rounded-md bg-primary hover:bg-primaryHover hover:shadow-md"
        >
          {isSubmitting ? "Entrando..." : "Login"}
        </button>
      </form>
    </div>
  );
}
