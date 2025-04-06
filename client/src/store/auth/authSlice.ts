import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { AuthState } from "./types";
const userData = localStorage.getItem("user");
const token = localStorage.getItem("token");

const initialState: AuthState = {
  user: userData && userData !== "undefined" ? JSON.parse(userData) : null,
  error: null,
  token: token || null,
  isAuthenticated: !!token,
  is_teacher: userData && userData !== "undefined" ? JSON.parse(userData).is_teacher : false,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // const data = JSON.stringify(credentials);
      const response = await api.post("/auth/login", credentials, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.access_token);
      return response.data;
    } catch (err: any) {
      console.error("Login Error:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Login Failed");
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    userData: {
      name: string;
      email: string;
      password: string;
      is_teacher: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("auth/signup", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      localStorage.setItem("token", response.data.access_token);
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login Failed");
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googlelogin",
  async (googleToken: string, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/google/login", {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        }
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.access_token);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login Failed");
    }
  }
);

export const googleCallback = createAsyncThunk(
  "auth/googleCallback",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/google/callback?code=${code}`);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.access_token);
      console.log(response);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Google login failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      //  Signup
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      //  Google Login
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Google Callback
      .addCase(googleCallback.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })

      .addCase(googleCallback.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

const authReducer = authSlice.reducer;
export default authReducer;
