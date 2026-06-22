import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";
import {
  clearTokenEveryWhere,
  getToken,
  setToken,
} from "../../utils/tokenStorage";
import { resolveRandomAiAvatar } from "../../utils/mediaUrl";

const USER_PROFILE_FIELDS = [
  "name",
];

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

const isRecord = (value) =>
  value != null && typeof value === "object" && !Array.isArray(value);

const normalizeUserFromPayload = (payload) => {
  const root = isRecord(payload?.data) ? payload.data : payload ?? {};
  const data = isRecord(root?.data) ? root.data : root;
  const candidate = isRecord(data?.user)
    ? data.user
    : isRecord(root?.user)
      ? root.user
      : null;

  if (!candidate) return null;

  if (
    candidate?.id != null ||
    candidate?.name != null ||
    candidate?.email != null ||
    candidate?.avatar != null
  ) {
    const normalized = { ...candidate };
    if (
      normalized.company_role == null &&
      typeof normalized.user_type === "string"
    ) {
      normalized.company_role = normalized.user_type;
    }
    if (
      Object.prototype.hasOwnProperty.call(normalized, "project_roles") &&
      !Array.isArray(normalized.project_roles)
    ) {
      normalized.project_roles = [];
    }

    return normalized;
  }

  return null;
};

const normalizeProfileFromPayload = (payload) => {
  const root = isRecord(payload?.data) ? payload.data : payload ?? null;
  if (!isRecord(root)) return null;

  const data = isRecord(root?.data) ? root.data : root;
  const user = isRecord(data?.user)
    ? data.user
    : isRecord(root?.user)
      ? root.user
      : null;

  const profile = isRecord(data?.profile)
    ? data.profile
    : isRecord(root?.profile)
      ? root.profile
      : isRecord(user?.profile)
        ? user.profile
        : null;

  return profile;
};

const normalizeTokenExpiresAtFromPayload = (payload) => {
  const root = isRecord(payload?.data) ? payload.data : payload ?? {};
  return (
    root?.token_expires_at ??
    root?.tokenExpiresAt ??
    payload?.token_expires_at ??
    payload?.tokenExpiresAt ??
    null
  );
};

const pickFields = (payload, fields) => {
  const src = payload && typeof payload === "object" ? payload : {};
  const out = {};

  fields.forEach((key) => {
    if (src[key] === undefined) return;
    out[key] = typeof src[key] === "string" ? src[key].trim() : src[key];
  });

  return out;
};

const pickUserProfileFields = (payload) =>
  pickFields(payload, USER_PROFILE_FIELDS);

const pickProfileRecordFields = (payload) =>
  pickFields(payload, PROFILE_RECORD_FIELDS);

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
      const res = await api.post("/profile/avatar", body);
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
      const res = await api.get("/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateMyProfileThunk = createAsyncThunk(
  "auth/updateMyProfile",
  async (payload, { rejectWithValue }) => {
    const cleanPayload = stripAvatarPayload(payload);
    const userFields = pickUserProfileFields(cleanPayload);
    const profileFields = pickProfileRecordFields(cleanPayload);
    const profilePayload = {
      ...userFields,
      ...profileFields,
    };
    const avatarFile = getAvatarFileFromPayload(payload);
    const shouldUpdateProfile = Object.keys(profilePayload).length > 0;
    const shouldUpdateAvatar = typeof File !== "undefined" && avatarFile instanceof File;

    let profileRes = null;
    let avatarRes = null;

    try {
      if (shouldUpdateProfile) {
        profileRes = await api.patch("/profile", profilePayload);
      }

      if (shouldUpdateAvatar) {
        avatarRes = await api.post(
          "/profile/avatar",
          buildAvatarUpdateBody(avatarFile),
        );
      }

      const userFromResponse =
        normalizeUserFromPayload(avatarRes?.data) ??
        normalizeUserFromPayload(profileRes?.data);
      const profileFromResponse =
        normalizeProfileFromPayload(profileRes?.data) ??
        normalizeProfileFromPayload(avatarRes?.data) ??
        (isRecord(userFromResponse?.profile) ? userFromResponse.profile : null);

      return {
        user: userFromResponse,
        profile:
          profileFromResponse ??
          (Object.keys(profileFields).length ? profileFields : null),
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
      state.meStatus = "idle";
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
      const profile = normalizeProfileFromPayload(a.payload) ?? user?.profile ?? null;
      const rememberMe = !!a.meta?.arg?.rememberMe;
      const tokenExpiresAt = normalizeTokenExpiresAtFromPayload(a.payload);
      if (token) {
        s.accessToken = token;
        setToken(token, rememberMe, tokenExpiresAt);
      }

      s.user = user;
      s.profile = profile;
      if (profile) {
        s.profileStatus = "success";
        s.profileError = null;
      }
    });
    // NOTE: Register
    b.addCase(signUpThunk.fulfilled, (s, a) => {
      const token =
        a.payload?.access_token ||
        a.payload?.accessToken ||
        a.payload?.token ||
        a.payload?.data?.token;

      const user = normalizeUserFromPayload(a.payload);
      const profile = normalizeProfileFromPayload(a.payload) ?? user?.profile ?? null;

      const rememberMe = !!a.meta?.arg?.rememberMe;
      const tokenExpiresAt = normalizeTokenExpiresAtFromPayload(a.payload);

      if (token) {
        s.accessToken = token;
        setToken(token, rememberMe, tokenExpiresAt);
      }

      s.user = user;
      s.profile = profile;
      if (profile) {
        s.profileStatus = "success";
        s.profileError = null;
      }
    });
    b.addCase(assignRandomAvatarThunk.fulfilled, (s, a) => {
      const user = normalizeUserFromPayload(a.payload);
      if (user) s.user = { ...(s.user || {}), ...user };
      const profile = normalizeProfileFromPayload(a.payload) ?? user?.profile ?? null;
      if (profile) {
        s.profile = { ...(s.profile || {}), ...profile };
        s.profileStatus = "success";
        s.profileError = null;
      }
    });

    // NOTE: Me
    b.addCase(meThunk.pending, (s) => {
      s.meStatus = "loading";
    });
    b.addCase(meThunk.fulfilled, (s, a) => {
      const meUser = normalizeUserFromPayload(a.payload);
      const meProfile = normalizeProfileFromPayload(a.payload) ?? meUser?.profile ?? null;
      s.user = meUser ?? null;
      if (meProfile) {
        s.profile = meProfile;
        s.profileStatus = "success";
        s.profileError = null;
      }
      s.meStatus = "success";
    });
    b.addCase(meThunk.rejected, (s, a) => {
      s.user = null;
      s.profile = null;
      s.meStatus = "failed";
      s.profileStatus = "idle";
      s.profileError = null;
      if (Number(a.payload?.status ?? 0) === 401) {
        s.accessToken = null;
        clearTokenEveryWhere();
      }
    });

    b.addCase(getMyProfileThunk.pending, (s) => {
      s.profileStatus = "loading";
      s.profileError = null;
    });
    b.addCase(getMyProfileThunk.fulfilled, (s, a) => {
      const profile = normalizeProfileFromPayload(a.payload);
      const userFromProfile = normalizeUserFromPayload(a.payload);
      const nextProfile = profile ?? userFromProfile?.profile ?? null;
      if (userFromProfile) {
        s.user = { ...(s.user || {}), ...userFromProfile };
      }
      s.profile = nextProfile
        ? { ...(s.profile || {}), ...nextProfile }
        : null;
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
      if (a.payload?.user) s.user = { ...(s.user || {}), ...a.payload.user };
      if (a.payload?.profile) {
        s.profile = { ...(s.profile || {}), ...a.payload.profile };
      } else if (a.payload?.user?.profile) {
        s.profile = { ...(s.profile || {}), ...a.payload.user.profile };
      }
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
      s.meStatus = "idle";
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
      s.meStatus = "idle";
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
