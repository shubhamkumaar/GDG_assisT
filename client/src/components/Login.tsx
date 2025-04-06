import React, {
  // useEffect,
  useState,
} from "react";
import {
  useDispatch,
  useSelector,
  // useSelector
} from "react-redux";
import { AppDispatch } from "../store/store";
import {
  googleLogin,
  // googleCallback,
  // googleLogin,
  loginUser,
} from "../store/auth/authSlice";
import {
  useNavigate,
  // useSearchParams
} from "react-router-dom";
// import { RootState } from "@reduxjs/toolkit/query";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;


export default function LoginPage() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // const token = useSelector(state=>Root)

  // const [searchParams] = useSearchParams();
  // const { user, error } = useSelector((state: RootState) => state.auth);

  // useEffect(() => {
  //   const code = searchParams.get("code");
  //   if (code) {
  //     dispatch(googleCallback(code));
  //   }
  // }, [dispatch, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(dispatch);
    // console.log(email);
    dispatch(loginUser({ username, password }));
    navigate("/");
  };

  const handleGoogleLogin = async (response: any) => {
    // console.log("Logging in with Google");
    // dispatch(googleLogin());
    console.log(response.credential);
    if (response.credential) {
      dispatch(googleLogin(response.credential));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex-col gap-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={username}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              // clientId="564727465848-lfgrau28p1p9mp1tf0umv73ua9r9behi.apps.googleusercontent.com"
              onSuccess={handleGoogleLogin}
              onError={() => console.log("Google Login Failed")}
              // redirectUri="http://localhost:5173"
            />
          </div>
        </div>
      </div>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md flex justify-center">
        <div className="text-sm mb-0">
          Don't have an account?
          <Link
            to="/signup"
            className="font-medium text-blue-500 hover:text-blue-500 ml-1">
          Sign up
          </Link>
          </div>
      </div>
    </div>
  );
}
