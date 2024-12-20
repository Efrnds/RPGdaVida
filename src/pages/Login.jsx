import { FaRegEye, FaRegEyeSlash, FaRegUser } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [onUsername, setOnUsername] = useState(false);
  const [onPassword, setOnPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/home");
  };

  return (
    <>
      <div className="flex flex-col w-full gap-4 p-3 m-auto mx-4 border rounded-md shadow-md md:mx-auto md:w-1/2 border-slate-300">
        <h1 className="text-3xl font-bold text-center">Bem-vindo!</h1>
        <p className="text-center text-slate-500">
          Faça login para acessar a sua conta
        </p>
        <form
          onSubmit={handleLogin}
          className="flex flex-col w-full gap-10 mx-auto sm:w-1/2"
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
                type="text"
                name="username"
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
                type="checkbox"
                className="w-5 h-5 my-auto "
                name="remember"
              />{" "}
              <label htmlFor="remember" className="my-auto text-slate-500">
                Lembrar de mim?
              </label>
            </div>
            <Link
              to="/reset-pass"
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
    </>
  );
}
