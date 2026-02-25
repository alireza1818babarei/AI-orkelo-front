import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader } from "reactstrap";

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

const toDisplayValue = (value) => {
  if (value == null || value === "") return "-";
  return String(value);
};

const AboutMe = () => {
  const profile = useSelector((s) => s.auth?.profile ?? null);

  const summaryText = useMemo(() => {
    const raw = profile?.about_me ?? "";
    if (String(raw).trim()) return String(raw).trim();
    return "No bio has been added yet.";
  }, [profile]);

  const profileItems = useMemo(
    () => [
      {
        key: "work_passion",
        label: "Work Passion",
        icon: "ti ti-briefcase",
        value: profile?.work_passion,
      },
      {
        key: "email",
        label: "Email",
        icon: "ti ti-mail",
        value: profile?.email,
      },
      {
        key: "contact",
        label: "Contact",
        icon: "ti ti-phone",
        value: profile?.contact,
      },
      {
        key: "birth_date",
        label: "Birth Date",
        icon: "ti ti-calendar-event",
        value: formatDate(profile?.birth_date),
      },
      {
        key: "location",
        label: "Location",
        icon: "ti ti-map-pin",
        value: profile?.location,
      },
      {
        key: "website",
        label: "Website",
        icon: "ti ti-device-laptop",
        value: profile?.website,
      },
      {
        key: "github",
        label: "Github",
        icon: "ti ti-brand-github",
        value: profile?.github,
      },
    ],
    [profile],
  );

  return (
    <Card>
      <CardHeader>
        <h5>About Me</h5>
      </CardHeader>
      <CardBody>
        <p className="text-muted f-s-13">{summaryText}</p>

        <div className="about-list">
          {profileItems.map((item) => (
            <div key={item.key}>
              <span className="fw-medium">
                <i className={item.icon}></i> {item.label}
              </span>
              <span className="float-end f-s-13 text-secondary">
                {toDisplayValue(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default AboutMe;
