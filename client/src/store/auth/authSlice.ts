import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { AuthState, User } from "./types";

const userData = localStorage.getItem("user");
const token = localStorage.getItem("token");
// console.log(userData);

const initialState: AuthState = {
  user: userData && userData !== "undefined" ? JSON.parse(userData) : null,
  error: null,
  token: token || null,
  isAuthenticated: !!token,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // console.log(credentials);
      // const data = JSON.stringify(credentials);
      const response = await api.post("/auth/login", credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
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
    userData: { name: string; email: string; password: string },
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
  "/auth/googlelogin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/google/login");
      window.location.href = response.data; // Redirect user to Google OAuth
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
      localStorage.setItem("token", response.data.access_token);
      return response.data.user;
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
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // state.token = action.payload.token;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(signupUser.pending, (state) => {
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(googleCallback.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token; // Ensure token is stored
        state.error = null;
      })
      .addCase(googleCallback.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});
const authReducer = authSlice.reducer;
export default authReducer;
