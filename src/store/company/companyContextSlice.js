import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeCompany = (item) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const rawId = item.id;
  const parsedId = Number(rawId);
  const id =
    Number.isInteger(parsedId) && parsedId > 0
      ? parsedId
      : rawId != null
        ? rawId
        : null;

  if (id == null) return null;

  return {
    id,
    name: String(item.name ?? "").trim(),
    status: item.status ?? null,
    image: item.image ?? null,
    is_default: Boolean(item.is_default),
    is_active: Boolean(item.is_active),
    membership:
      item.membership && typeof item.membership === "object"
        ? item.membership
        : null,
  };
};

const uniqueById = (items) => {
  const used = new Set();
  const out = [];

  (Array.isArray(items) ? items : []).forEach((item) => {
    const company = normalizeCompany(item);
    if (!company) return;

    const key = String(company.id);
    if (used.has(key)) return;
    used.add(key);
    out.push(company);
  });

  return out;
};

const normalizeContextPayload = (payload) => {
  const root = payload?.data ?? payload ?? null;
  const data = root?.data ?? root ?? null;

  const activeCompany = normalizeCompany(
    data?.active_company ?? data?.company ?? root?.active_company ?? root?.company,
  );

  const companies = uniqueById(
    data?.companies ?? root?.companies ?? [],
  );

  const activeId =
    activeCompany?.id ??
    companies.find((company) => company.is_active)?.id ??
    null;

  const normalizedCompanies = companies.map((company) => ({
    ...company,
    is_active:
      activeId != null
        ? String(company.id) === String(activeId)
        : Boolean(company.is_active),
  }));

  const normalizedActiveCompany =
    normalizedCompanies.find((company) =>
      activeId != null
        ? String(company.id) === String(activeId)
        : Boolean(company.is_active),
    ) ??
    activeCompany ??
    normalizedCompanies[0] ??
    null;

  return {
    activeCompany: normalizedActiveCompany,
    activeCompanyId: normalizedActiveCompany?.id ?? activeId ?? null,
    companies: normalizedCompanies,
  };
};

const upsertCompany = (items, nextCompany) => {
  const company = normalizeCompany(nextCompany);
  if (!company) return uniqueById(items);

  const nextItems = uniqueById(items);
  const idx = nextItems.findIndex(
    (current) => String(current.id) === String(company.id),
  );

  if (idx >= 0) {
    nextItems[idx] = { ...nextItems[idx], ...company };
  } else {
    nextItems.unshift(company);
  }

  return nextItems;
};

const normalizeCompanyFromMutationPayload = (payload) => {
  const root = payload?.data ?? payload ?? null;
  const data = root?.data ?? root ?? null;
  return normalizeCompany(
    data?.company ?? root?.company ?? data,
  );
};

export const getCompanyContextThunk = createAsyncThunk(
  "companyContext/get",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/companies/my");
      return normalizeContextPayload(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const setActiveCompanyThunk = createAsyncThunk(
  "companyContext/setActive",
  async ({ companyId }, { rejectWithValue }) => {
    try {
      const res = await api.patch("/companies/my/active", {
        company_id: companyId,
      });

      const root = res?.data?.data ?? res?.data ?? null;
      const company = normalizeCompany(
        root?.company ?? root?.active_company ?? root,
      );

      return {
        companyId,
        company,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateMyCompanyThunk = createAsyncThunk(
  "companyContext/updateMyCompany",
  async ({ name, image } = {}, { rejectWithValue }) => {
    try {
      const hasImage = typeof File !== "undefined" && image instanceof File;
      const payload = hasImage ? new FormData() : {};

      if (name !== undefined) {
        const trimmedName = String(name ?? "").trim();
        if (hasImage) {
          payload.append("name", trimmedName);
        } else {
          payload.name = trimmedName;
        }
      }

      if (hasImage) {
        payload.append("image", image);
      }

      const res = await api.patch("/companies/my", payload);
      return {
        company: normalizeCompanyFromMutationPayload(res?.data),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const removeMyCompanyImageThunk = createAsyncThunk(
  "companyContext/removeMyCompanyImage",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete("/companies/my/image");
      return {
        company: normalizeCompanyFromMutationPayload(res?.data),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  ownerUserId: null,
  items: [],
  activeCompany: null,
  activeCompanyId: null,
  status: "idle",
  error: null,
  switchingCompanyId: null,
  switchError: null,
  updateStatus: "idle",
  updateError: null,
  removeImageStatus: "idle",
  removeImageError: null,
};

const companyContextSlice = createSlice({
  name: "companyContext",
  initialState,
  reducers: {
    clearCompanyContextState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanyContextThunk.pending, (state, action) => {
      const nextUserId = action.meta?.arg?.userId ?? state.ownerUserId ?? null;
      const isUserSwitched =
        state.ownerUserId != null &&
        nextUserId != null &&
        String(state.ownerUserId) !== String(nextUserId);

      state.status = "loading";
      state.error = null;
      state.ownerUserId = nextUserId;

      if (isUserSwitched) {
        state.items = [];
        state.activeCompany = null;
        state.activeCompanyId = null;
      }
    });
    builder.addCase(getCompanyContextThunk.fulfilled, (state, action) => {
      const { companies, activeCompany, activeCompanyId } = action.payload || {};
      state.status = "succeeded";
      state.error = null;
      state.items = uniqueById(companies);
      state.activeCompany = activeCompany ?? null;
      state.activeCompanyId = activeCompanyId ?? null;
    });
    builder.addCase(getCompanyContextThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Failed to load companies" };
      state.items = [];
      state.activeCompany = null;
      state.activeCompanyId = null;
    });

    builder.addCase(setActiveCompanyThunk.pending, (state, action) => {
      state.switchError = null;
      state.switchingCompanyId = action.meta?.arg?.companyId ?? null;
    });
    builder.addCase(setActiveCompanyThunk.fulfilled, (state, action) => {
      const companyId = action.payload?.company?.id ?? action.payload?.companyId ?? null;
      const switchedCompany = action.payload?.company ?? null;

      state.switchError = null;
      state.switchingCompanyId = null;
      state.activeCompanyId = companyId;

      const nextItems = upsertCompany(state.items, switchedCompany);
      state.items = nextItems.map((company) => ({
        ...company,
        is_active:
          companyId != null
            ? String(company.id) === String(companyId)
            : Boolean(company.is_active),
      }));

      state.activeCompany =
        state.items.find((company) =>
          companyId != null
            ? String(company.id) === String(companyId)
            : Boolean(company.is_active),
        ) ?? switchedCompany;
    });
    builder.addCase(setActiveCompanyThunk.rejected, (state, action) => {
      state.switchingCompanyId = null;
      state.switchError = action.payload || { message: "Company switch failed" };
    });

    builder.addCase(updateMyCompanyThunk.pending, (state) => {
      state.updateStatus = "loading";
      state.updateError = null;
    });
    builder.addCase(updateMyCompanyThunk.fulfilled, (state, action) => {
      state.updateStatus = "succeeded";
      state.updateError = null;

      const updatedCompany = action.payload?.company ?? null;
      if (!updatedCompany) return;

      const nextItems = upsertCompany(state.items, updatedCompany);
      const nextActiveId = state.activeCompanyId ?? updatedCompany.id ?? null;
      state.activeCompanyId = nextActiveId;
      state.items = nextItems.map((company) => ({
        ...company,
        is_active:
          nextActiveId != null
            ? String(company.id) === String(nextActiveId)
            : Boolean(company.is_active),
      }));

      if (
        nextActiveId == null ||
        String(updatedCompany.id) === String(nextActiveId)
      ) {
        state.activeCompany = {
          ...(state.activeCompany || {}),
          ...updatedCompany,
        };
      }
    });
    builder.addCase(updateMyCompanyThunk.rejected, (state, action) => {
      state.updateStatus = "failed";
      state.updateError = action.payload || { message: "Company update failed" };
    });

    builder.addCase(removeMyCompanyImageThunk.pending, (state) => {
      state.removeImageStatus = "loading";
      state.removeImageError = null;
    });
    builder.addCase(removeMyCompanyImageThunk.fulfilled, (state, action) => {
      state.removeImageStatus = "succeeded";
      state.removeImageError = null;

      const updatedCompany = action.payload?.company ?? null;
      if (updatedCompany) {
        const nextItems = upsertCompany(state.items, updatedCompany);
        const nextActiveId = state.activeCompanyId ?? updatedCompany.id ?? null;
        state.activeCompanyId = nextActiveId;
        state.items = nextItems.map((company) => ({
          ...company,
          is_active:
            nextActiveId != null
              ? String(company.id) === String(nextActiveId)
              : Boolean(company.is_active),
        }));

        if (
          nextActiveId == null ||
          String(updatedCompany.id) === String(nextActiveId)
        ) {
          state.activeCompany = {
            ...(state.activeCompany || {}),
            ...updatedCompany,
          };
        }
        return;
      }

      const targetId = state.activeCompanyId ?? state.activeCompany?.id ?? null;
      if (targetId == null) return;

      state.items = (state.items || []).map((company) =>
        String(company.id) === String(targetId)
          ? { ...company, image: null }
          : company,
      );
      state.activeCompany = state.activeCompany
        ? { ...state.activeCompany, image: null }
        : state.activeCompany;
    });
    builder.addCase(removeMyCompanyImageThunk.rejected, (state, action) => {
      state.removeImageStatus = "failed";
      state.removeImageError =
        action.payload || { message: "Company image remove failed" };
    });
  },
});

export const { clearCompanyContextState } = companyContextSlice.actions;
export default companyContextSlice.reducer;
