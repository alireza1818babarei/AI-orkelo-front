import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";
import {
  clearTokenEveryWhere,
  getToken,
  setToken,
} from "../../utils/tokenStorage";

// NOTE: LOGIN THUNK
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// NOTE: SIGNUP THUNK
export const signUpThunk = createAsyncThunk(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// NOTE ME THUNK
export const meThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// NOTE: LOGOUT THUNK
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/logout");
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  user: null,
  accessToken: getToken(),
  loading: false,
  error: null,
  meStatus: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // NOTE: LOGOUT
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      clearTokenEveryWhere();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    // NOTE: Login
    b.addCase(loginThunk.fulfilled, (s, a) => {
      const token =
        a.payload?.access_token ||
        a.payload?.data.token ||
        a.payload?.accessToken;

      const user = a.payload?.user || a.payload?.data?.user || null;
      const rememberMe = !!a.meta?.arg?.rememberMe;
      if (token) {
        s.accessToken = token;
        setToken(token, rememberMe);
      }

      s.user = user;
    });
    // NOTE: Register
    b.addCase(signUpThunk.fulfilled, (s, a) => {
      const token =
        a.payload?.access_token ||
        a.payload?.accessToken ||
        a.payload?.token ||
        a.payload?.data.token;

      const user = a.payload?.user || a.payload?.data?.user || null;

      const rememberMe = !!a.meta?.arg?.rememberMe;

      if (token) {
        s.accessToken = token;
        setToken(token, rememberMe);
      }

      s.user = user;
    });

    // NOTE: Me
    b.addCase(meThunk.pending, (s) => {
      s.meStatus = "loading";
    });
    b.addCase(meThunk.fulfilled, (s, a) => {
      s.user = a.payload?.data?.user ??  null;
      s.meStatus = "success";
    });
    b.addCase(meThunk.rejected, (s, a) => {
      s.user = null;
      s.meStatus = "failed";
    });

    // NOTE: Logout
    b.addCase(logoutThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null;
      s.accessToken = null;
      s.error = null;
      clearTokenEveryWhere();
      s.loading = false;
    });
    b.addCase(logoutThunk.rejected, (s, a) => {
      s.user = null;
      s.accessToken = null;
      s.error = a.payload || { message: "Unknown Error" };
      clearTokenEveryWhere();
      s.loading = false;
    });

    b.addMatcher(
      isAnyOf(loginThunk.pending, signUpThunk.pending),
      (s) => {
        s.loading = true;
        s.error = null;
      },
    );

    b.addMatcher(
      isAnyOf(loginThunk.rejected, signUpThunk.rejected),
      (s, a) => {
        s.loading = false;
        s.error = a.payload || { message: "Unknown Error" };
      },
    );

    b.addMatcher(
      isAnyOf(loginThunk.fulfilled, signUpThunk.fulfilled, meThunk.fulfilled),
      (s) => {
        s.loading = false;
      },
    );
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
