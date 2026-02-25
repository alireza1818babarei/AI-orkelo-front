import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { resolveUserAvatarWithFallback } from "../../utils/mediaUrl";
import { toastError, toastInfo, toastSuccess } from "../../utils/sweetAlert";
import { updateMyProfileThunk } from "../../store/auth/authSlice";

const getUserAvatarRaw = (user) =>
  user?.avatar ?? "";

const revokeObjectUrl = (value) => {
  if (typeof value !== "string" || !value.startsWith("blob:")) return;
  try {
    URL.revokeObjectURL(value);
  } catch {
    // Ignore URL revoke errors.
  }
};

const buildProfileForm = (profile, user) => ({
  about_me: profile?.about_me ?? "",
  work_passion: profile?.work_passion ?? "",
  email: profile?.email ?? user?.email ?? "",
  contact: profile?.contact ?? "",
  birth_date: profile?.birth_date ?? "",
  location: profile?.location ?? "",
  website: profile?.website ?? "",
  github: profile?.github ?? "",
  avatar_file: null,
  avatarPreviewUrl: "",
});

const normalizeForCompare = (value) => String(value ?? "").trim();

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const toDisplay = (value) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const ProfileCard = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth?.user ?? null);
  const profile = useSelector((s) => s.auth?.profile ?? null);
  const profileUpdateStatus = useSelector(
    (s) => s.auth?.profileUpdateStatus ?? "idle",
  );
  const profileUpdateLocalOnly = useSelector(
    (s) => !!s.auth?.profileUpdateLocalOnly,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(buildProfileForm(profile, user));
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  useEffect(() => {
    if (isEditing) return;
    setForm(buildProfileForm(profile, user));
  }, [profile, user, isEditing]);

  useEffect(() => () => revokeObjectUrl(avatarPreviewUrl), [avatarPreviewUrl]);

  const userAvatar = useMemo(() => {
    const raw = avatarPreviewUrl || getUserAvatarRaw(user);
    const seed = user?.id ?? user?.email ?? user?.name ?? "profile-user";
    return resolveUserAvatarWithFallback(raw, seed);
  }, [avatarPreviewUrl, user]);

  const saving = profileUpdateStatus === "loading";

  const aboutPreview = useMemo(() => {
    const raw = profile?.about_me ?? "";
    return String(raw).trim() || "No bio has been added yet.";
  }, [profile]);

  const quickItems = useMemo(
    () => [
      { key: "work_passion", label: "Work Passion", value: profile?.work_passion },
      { key: "email", label: "Email", value: profile?.email ?? user?.email },
      { key: "contact", label: "Contact", value: profile?.contact },
      { key: "birth_date", label: "Birth Date", value: formatDate(profile?.birth_date) },
      { key: "location", label: "Location", value: profile?.location },
      { key: "website", label: "Website", value: profile?.website },
      { key: "github", label: "Github", value: profile?.github },
    ],
    [profile, user],
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearAvatarSelection = () => {
    setForm((prev) => ({ ...prev, avatar_file: null, avatarPreviewUrl: "" }));
    setAvatarPreviewUrl((prev) => {
      revokeObjectUrl(prev);
      return "";
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!String(file.type || "").startsWith("image/")) {
      toastError("Only image files are allowed");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("Image size must be smaller than 5MB");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      avatar_file: file,
      avatarPreviewUrl: preview,
    }));
    setAvatarPreviewUrl((prev) => {
      revokeObjectUrl(prev);
      return preview;
    });
    e.target.value = "";
  };

  const handleStartEdit = () => {
    setForm(buildProfileForm(profile, user));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    clearAvatarSelection();
    setForm(buildProfileForm(profile, user));
    setIsEditing(false);
  };

  const buildDiffPayload = () => {
    const base = buildProfileForm(profile, user);
    const payload = {};

    Object.entries(form).forEach(([key, value]) => {
      if (key === "avatar_file" || key === "avatarPreviewUrl") return;
      if (normalizeForCompare(value) === normalizeForCompare(base[key])) return;
      payload[key] = typeof value === "string" ? value.trim() : value;
    });

    if (
      typeof File !== "undefined" &&
      form.avatar_file instanceof File
    ) {
      payload.avatar_file = form.avatar_file;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildDiffPayload();
    const hadAvatarUpload =
      typeof File !== "undefined" && payload?.avatar_file instanceof File;
    const previousAvatar = getUserAvatarRaw(user);

    if (!Object.keys(payload).length) {
      toastInfo("No changes to save");
      setIsEditing(false);
      return;
    }

    try {
      const result = await dispatch(updateMyProfileThunk(payload)).unwrap();
      if (hadAvatarUpload) {
        const nextAvatar = getUserAvatarRaw(result?.user ?? null);
        if (!nextAvatar || nextAvatar === previousAvatar) {
          toastInfo("Profile saved, but avatar was not updated by backend.");
        } else {
          toastSuccess("Profile and avatar updated");
        }
      } else {
        toastSuccess("Profile updated");
      }
      clearAvatarSelection();
      setIsEditing(false);
    } catch (err) {
      toastError(err?.message || "Profile update failed");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-3 p-md-4">
        <Row className="g-4 align-items-start">
          <Col xl={4}>
            <div className="d-flex flex-column align-items-center text-center">
              <div className="avatar-upload">
                {isEditing ? (
                  <div className="avatar-edit">
                    <Input
                      type="file"
                      id="profileImageUpload"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleAvatarChange}
                      disabled={saving}
                    />
                    <Label htmlFor="profileImageUpload">
                      <i className="ti ti-photo-heart"></i>
                    </Label>
                  </div>
                ) : null}
                <div className="avatar-preview" style={{ width: 130, height: 130 }}>
                  <div
                    id="imgPreview"
                    style={
                      userAvatar
                        ? {
                            backgroundImage: `url(${userAvatar})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  ></div>
                </div>
              </div>

              {isEditing && form?.avatar_file ? (
                <div className="mt-2 text-center w-100">
                  <small className="d-block text-muted text-truncate px-2">
                    {form.avatar_file.name}
                  </small>
                  <Button
                    color="link"
                    className="p-0 f-s-12"
                    type="button"
                    onClick={clearAvatarSelection}
                    disabled={saving}
                  >
                    Clear selected image
                  </Button>
                </div>
              ) : null}

              <h5 className="f-w-600 text-capitalize mt-3 mb-1">
                {user?.name ?? "User"}
              </h5>
              <p className="text-muted mb-1">{toDisplay(profile?.email ?? user?.email)}</p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {user?.user_type ? (
                  <span className="badge text-bg-light">{user.user_type}</span>
                ) : null}
                {user?.status ? (
                  <span className="badge text-bg-primary">{user.status}</span>
                ) : null}
              </div>

              {!isEditing ? (
                <Button
                  color="primary"
                  className="mt-3 w-100"
                  type="button"
                  onClick={handleStartEdit}
                >
                  Edit User Profile
                </Button>
              ) : null}
            </div>
          </Col>

          <Col xl={8}>
            {isEditing ? (
              <Form className="app-form" onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col xs={12}>
                    <div className="mb-0">
                      <Label for="profileAboutMe" className="small text-muted mb-1">
                        About Me
                      </Label>
                      <Input
                        id="profileAboutMe"
                        name="about_me"
                        type="textarea"
                        rows={3}
                        value={form.about_me}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="mb-0">
                      <Label for="profileWorkPassion" className="small text-muted mb-1">
                        Work Passion
                      </Label>
                      <Input
                        id="profileWorkPassion"
                        name="work_passion"
                        value={form.work_passion}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="mb-0">
                      <Label for="profileEmail" className="small text-muted mb-1">
                        Profile Email
                      </Label>
                      <Input
                        id="profileEmail"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="mb-0">
                      <Label for="profileContact" className="small text-muted mb-1">
                        Contact
                      </Label>
                      <Input
                        id="profileContact"
                        name="contact"
                        value={form.contact}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="mb-0">
                      <Label for="profileBirthDate" className="small text-muted mb-1">
                        Birth Date
                      </Label>
                      <Input
                        id="profileBirthDate"
                        name="birth_date"
                        type="date"
                        value={form.birth_date}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="mb-0">
                      <Label for="profileGithub" className="small text-muted mb-1">
                        Github
                      </Label>
                      <Input
                        id="profileGithub"
                        name="github"
                        value={form.github}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="mb-0">
                      <Label for="profileWebsite" className="small text-muted mb-1">
                        Website
                      </Label>
                      <Input
                        id="profileWebsite"
                        name="website"
                        value={form.website}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="mb-0">
                      <Label for="profileLocation" className="small text-muted mb-1">
                        Location
                      </Label>
                      <Input
                        id="profileLocation"
                        name="location"
                        value={form.location}
                        onChange={handleFormChange}
                        disabled={saving}
                      />
                    </div>
                  </Col>
                </Row>

                <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mt-4">
                  <Button color="light" type="button" onClick={handleCancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                  <Button color="primary" disabled={saving} type="submit">
                    {saving ? (
                      <span className="d-inline-flex align-items-center gap-2">
                        <Spinner size="sm" />
                        <span>Saving...</span>
                      </span>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>

                {profileUpdateLocalOnly ? (
                  <p className="small text-warning mt-2 mb-0 text-end">
                    Updated locally only.
                  </p>
                ) : null}
              </Form>
            ) : (
              <div className="border rounded-3 p-3 h-100">
                <h6 className="mb-2">Profile Summary</h6>
                <p
                  className="text-muted small mb-3"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {aboutPreview}
                </p>

                <Row className="g-2">
                  {quickItems.map((item) => (
                    <Col key={item.key} xs={12} sm={6}>
                      <div className="border rounded-2 p-2 h-100">
                        <div className="small text-muted">{item.label}</div>
                        <div className="fw-medium text-dark text-break">
                          {toDisplay(item.value)}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
