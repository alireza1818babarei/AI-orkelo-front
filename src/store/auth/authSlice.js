import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";
import {
  clearTokenEveryWhere,
  getToken,
  setToken,
} from "../../utils/tokenStorage";
import { resolveRandomAiAvatar } from "../../utils/mediaUrl";

const PROFILE_RECORD_FIELDS = [
  "about_me",
  "work_passion",
  "email",
  "contact",
  "birth_date",
  "location",
  "website",
  "github",
];

const normalizeUserFromPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  const candidate = data?.user ?? root?.user ?? null;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;

  if (
    candidate?.id != null ||
    candidate?.name != null ||
    candidate?.email != null ||
    candidate?.avatar != null
  ) {
    return candidate;
  }

  return null;
};

const normalizeProfileFromPayload = (payload) => {
  const root = payload?.data ?? payload ?? null;
  if (!root || typeof root !== "object" || Array.isArray(root)) return null;

  const profile =
    (root?.profile && typeof root.profile === "object" ? root.profile : null) ??
    (root?.data?.profile && typeof root.data.profile === "object"
      ? root.data.profile
      : null);

  return profile && !Array.isArray(profile) ? profile : null;
};

const pickProfileRecordFields = (payload) => {
  const src = payload && typeof payload === "object" ? payload : {};
  const out = {};

  PROFILE_RECORD_FIELDS.forEach((key) => {
    if (src[key] === undefined) return;
    out[key] = typeof src[key] === "string" ? src[key].trim() : src[key];
  });

  return out;
};

const PROFILE_AVATAR_KEYS = new Set(["avatar_file", "avatarFile", "avatarPreviewUrl"]);

const getAvatarFileFromPayload = (payload) => {
  const src = payload && typeof payload === "object" ? payload : {};
  return src?.avatar_file ?? src?.avatarFile ?? null;
};

const stripAvatarPayload = (payload) => {
  const src = payload && typeof payload === "object" ? payload : {};
  const out = {};
  Object.entries(src).forEach(([key, value]) => {
    if (value === undefined) return;
    if (PROFILE_AVATAR_KEYS.has(key)) return;
    out[key] = value;
  });
  return out;
};

const buildAvatarUpdateBody = (avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  return formData;
};

const getFileExtensionFromPath = (path) => {
  const value = String(path || "");
  const clean = value.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  if (parts.length < 2) return "jpg";
  return (parts.pop() || "jpg").toLowerCase();
};

const createRandomAvatarFormData = async () => {
  if (typeof fetch !== "function") {
    throw new Error("Avatar fetch is not available");
  }
  if (typeof File === "undefined") {
    throw new Error("File API is not available");
  }

  const randomAvatarPath = resolveRandomAiAvatar(
    `${Date.now()}-${Math.random()}`,
  );
  if (!randomAvatarPath) {
    throw new Error("Random avatar path not found");
  }

  const res = await fetch(randomAvatarPath);
  if (!res.ok) {
    throw new Error("Failed to load random avatar");
  }

  const blob = await res.blob();
  const extension = getFileExtensionFromPath(randomAvatarPath);
  const avatarFile = new File(
    [blob],
    `signup-avatar-${Date.now()}.${extension}`,
    { type: blob.type || "image/jpeg" },
  );

  return buildAvatarUpdateBody(avatarFile);
};

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

export const assignRandomAvatarThunk = createAsyncThunk(
  "auth/assignRandomAvatar",
  async (_, { rejectWithValue }) => {
    try {
      const body = await createRandomAvatarFormData();
      const res = await api.post("/auth/profile/avatar", body);
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

export const getMyProfileThunk = createAsyncThunk(
  "auth/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateMyProfileThunk = createAsyncThunk(
  "auth/updateMyProfile",
  async (payload, { rejectWithValue }) => {
    const profileFields = pickProfileRecordFields(payload);
    const profilePayload = pickProfileRecordFields(stripAvatarPayload(payload));
    const avatarFile = getAvatarFileFromPayload(payload);
    const shouldUpdateProfile = Object.keys(profilePayload).length > 0;
    const shouldUpdateAvatar = typeof File !== "undefined" && avatarFile instanceof File;

    let profileRes = null;
    let avatarRes = null;

    try {
      if (shouldUpdateProfile) {
        profileRes = await api.patch("/auth/profile", profilePayload);
      }

      if (shouldUpdateAvatar) {
        avatarRes = await api.post(
          "/auth/profile/avatar",
          buildAvatarUpdateBody(avatarFile),
        );
      }

      const userFromResponse =
        normalizeUserFromPayload(avatarRes?.data) ??
        normalizeUserFromPayload(profileRes?.data);
      const profileFromResponse = normalizeProfileFromPayload(profileRes?.data);

      return {
        user: userFromResponse,
        profile: profileFromResponse ?? (shouldUpdateProfile ? profileFields : null),
        localOnly: false,
      };
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
  profile: null,
  accessToken: getToken(),
  loading: false,
  error: null,
  meStatus: "idle",
  profileStatus: "idle",
  profileError: null,
  profileUpdateStatus: "idle",
  profileUpdateError: null,
  profileUpdateLocalOnly: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // NOTE: LOGOUT
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.accessToken = null;
      state.error = null;
      state.profileStatus = "idle";
      state.profileError = null;
      state.profileUpdateStatus = "idle";
      state.profileUpdateError = null;
      state.profileUpdateLocalOnly = false;
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
        a.payload?.data?.token ||
        a.payload?.accessToken;

      const user = normalizeUserFromPayload(a.payload);
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
        a.payload?.data?.token;

      const user = normalizeUserFromPayload(a.payload);

      const rememberMe = !!a.meta?.arg?.rememberMe;

      if (token) {
        s.accessToken = token;
        setToken(token, rememberMe);
      }

      s.user = user;
    });
    b.addCase(assignRandomAvatarThunk.fulfilled, (s, a) => {
      const user = normalizeUserFromPayload(a.payload);
      if (user) s.user = { ...(s.user || {}), ...user };
    });

    // NOTE: Me
    b.addCase(meThunk.pending, (s) => {
      s.meStatus = "loading";
    });
    b.addCase(meThunk.fulfilled, (s, a) => {
      const meUser = normalizeUserFromPayload(a.payload);
      s.user = meUser ?? null;
      s.meStatus = "success";
    });
    b.addCase(meThunk.rejected, (s, a) => {
      s.user = null;
      s.meStatus = "failed";
    });

    b.addCase(getMyProfileThunk.pending, (s) => {
      s.profileStatus = "loading";
      s.profileError = null;
    });
    b.addCase(getMyProfileThunk.fulfilled, (s, a) => {
      const profile = normalizeProfileFromPayload(a.payload);
      const userFromProfile = normalizeUserFromPayload(a.payload);
      if (userFromProfile) {
        s.user = userFromProfile;
      }
      s.profile = profile;
      s.profileStatus = "success";
      s.profileError = null;
    });
    b.addCase(getMyProfileThunk.rejected, (s, a) => {
      s.profileStatus = "failed";
      s.profileError = a.payload || { message: "Unknown Error" };
    });

    b.addCase(updateMyProfileThunk.pending, (s) => {
      s.profileUpdateStatus = "loading";
      s.profileUpdateError = null;
      s.profileUpdateLocalOnly = false;
    });
    b.addCase(updateMyProfileThunk.fulfilled, (s, a) => {
      if (a.payload?.user) s.user = a.payload.user;
      if (a.payload?.profile) s.profile = a.payload.profile;
      s.profileStatus = "success";
      s.profileError = null;
      s.profileUpdateStatus = "success";
      s.profileUpdateError = null;
      s.profileUpdateLocalOnly = false;
    });
    b.addCase(updateMyProfileThunk.rejected, (s, a) => {
      s.profileUpdateStatus = "failed";
      s.profileUpdateError = a.payload || { message: "Unknown Error" };
      s.profileUpdateLocalOnly = false;
    });

    // NOTE: Logout
    b.addCase(logoutThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null;
      s.profile = null;
      s.accessToken = null;
      s.error = null;
      s.profileStatus = "idle";
      s.profileError = null;
      s.profileUpdateStatus = "idle";
      s.profileUpdateError = null;
      s.profileUpdateLocalOnly = false;
      clearTokenEveryWhere();
      s.loading = false;
    });
    b.addCase(logoutThunk.rejected, (s, a) => {
      s.user = null;
      s.profile = null;
      s.accessToken = null;
      s.error = a.payload || { message: "Unknown Error" };
      s.profileStatus = "idle";
      s.profileError = null;
      s.profileUpdateStatus = "idle";
      s.profileUpdateError = null;
      s.profileUpdateLocalOnly = false;
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
