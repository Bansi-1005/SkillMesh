
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  LoaderCircle,
  X,
  AlertTriangle,
  UserPlus,
  UserRound,
  LockKeyhole,
  Phone,
  Eye,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

// =====================================================
// API HELPER
// =====================================================

async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem("skillmesh_token");

  const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        (typeof data === "string" ? data : "") ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

// =====================================================
// API RESPONSE HELPERS
// =====================================================

function getArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.users)) return data.users;

  return [];
}

// Read properties without depending on capitalization.
function getValue(item, ...keys) {
  for (const key of keys) {
    const actualKey = Object.keys(item || {}).find(
      (itemKey) => itemKey.toLowerCase() === key.toLowerCase()
    );

    if (actualKey && item[actualKey] != null) {
      return item[actualKey];
    }
  }

  return "";
}

// Read the first non-empty creation-date property.
function getCreatedAtValue(learner) {
  const possibleDateKeys = [
    "createdAt",
    "CreatedAt",
    "createdAtUtc",
    "CreatedAtUtc",
    "createdDate",
    "CreatedDate",
    "dateCreated",
    "DateCreated",
    "createdOn",
    "CreatedOn",
    "registeredAt",
    "RegisteredAt",
    "registeredAtUtc",
    "RegisteredAtUtc",
    "registrationDate",
    "RegistrationDate",
    "registeredOn",
    "RegisteredOn",
    "dateRegistered",
    "DateRegistered",
    "created_at",
    "registered_at",
  ];

  for (const key of possibleDateKeys) {
    const actualKey = Object.keys(learner || {}).find(
      (itemKey) => itemKey.toLowerCase() === key.toLowerCase()
    );

    if (actualKey) {
      const value = learner[actualKey];

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
  }

  return "";
}

function getBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  );
}

function getLearnerName(learner) {
  const firstName = getValue(learner, "firstName");
  const lastName = getValue(learner, "lastName");
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || getValue(learner, "fullName", "name") || "Learner";
}

function getEffectiveStatus(learner) {
  return (
    getBoolean(getValue(learner, "isActive")) &&
    getBoolean(getValue(learner, "adminIsActive")) &&
    getBoolean(getValue(learner, "organizationIsActive"))
  );
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Format a date without displaying "Not available" for valid date strings.
function formatDate(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not available";
  }

  // Handle a SQL-style date such as "2026-10-23 14:30:00".
  let normalizedValue = value;

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)
  ) {
    normalizedValue = value.replace(" ", "T");
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
};

// =====================================================
// REUSABLE DETAILS ITEM
// =====================================================

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon size={15} />
        {label}
      </div>

      <p className="break-words text-sm font-semibold text-[#17233F]">
        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? value
          : "Not available"}
      </p>
    </div>
  );
}

// =====================================================
// LEARNER MANAGEMENT COMPONENT
// =====================================================

export default function LearnerManagement() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedLearner, setSelectedLearner] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [registerForm, setRegisterForm] = useState({ ...EMPTY_FORM });
  const [registering, setRegistering] = useState(false);

  // ===================================================
  // LOAD LEARNERS
  // ===================================================

  const loadLearners = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApi(
        "UserManagement/organization-learners"
      );

      setLearners(getArray(data));
    } catch (err) {
      setError(err.message || "Could not load learners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLearners();
  }, [loadLearners]);

  // ===================================================
  // CLOSE DIALOGS WITH ESCAPE
  // ===================================================

  useEffect(() => {
    if (!selectedLearner && !confirmAction) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && updatingId === null) {
        setSelectedLearner(null);
        setConfirmAction(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLearner, confirmAction, updatingId]);

  // ===================================================
  // SEARCH AND FILTER
  // ===================================================

  const filteredLearners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return learners.filter((learner) => {
      const name = getLearnerName(learner).toLowerCase();

      const email = String(getValue(learner, "email")).toLowerCase();

      const organization = String(
        getValue(learner, "organizationName", "organization")
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        organization.includes(query);

      const active = getEffectiveStatus(learner);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [learners, search, statusFilter]);

  const activeCount = learners.filter(getEffectiveStatus).length;
  const inactiveCount = learners.length - activeCount;

  // ===================================================
  // REGISTRATION FORM
  // ===================================================

  function handleRegisterChange(event) {
    const { name, value } = event.target;

    setRegisterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function registerLearner(event) {
    event.preventDefault();

    if (registering) return;

    setError("");
    setMessage("");

    const firstName = registerForm.firstName.trim();
    const lastName = registerForm.lastName.trim();
    const email = registerForm.email.trim();
    const password = registerForm.password;
    const phone = registerForm.phone.trim();

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required learner details.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setRegistering(true);

    try {
      // The Admin's organization is obtained from their JWT
      // by AuthController. Do not send OrganizationId here.
      const payload = {
        firstName,
        lastName,
        email,
        password,
        phone: phone || null,
      };

      const result = await fetchApi(
        "Auth/register/organization-learner",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setRegisterForm({ ...EMPTY_FORM });

      setMessage(
        result?.message ||
          result?.Message ||
          "Learner registered successfully."
      );

      await loadLearners();
    } catch (err) {
      setError(err.message || "Could not register the learner.");
    } finally {
      setRegistering(false);
    }
  }

  // ===================================================
  // OPEN ACTIVATION / DEACTIVATION CONFIRMATION
  // ===================================================

  function toggleLearner(learner) {
    const learnerId = Number(
      getValue(learner, "userId", "learnerId")
    );

    if (
      !learnerId ||
      updatingId !== null ||
      confirmAction !== null
    ) {
      return;
    }

    const globalActive = getBoolean(
      getValue(learner, "isActive")
    );

    const organizationActive = getBoolean(
      getValue(learner, "organizationIsActive")
    );

    const adminActive = getBoolean(
      getValue(learner, "adminIsActive")
    );

    if (!globalActive) {
      setError(
        "Only Super Admin can reactivate this globally deactivated account."
      );
      return;
    }

    if (!organizationActive) {
      setError(
        "This organization is inactive. Contact Super Admin."
      );
      return;
    }

    setError("");
    setMessage("");

    setConfirmAction({
      learner,
      nextStatus: !adminActive,
    });
  }

  // ===================================================
  // CONFIRM ACTIVATION / DEACTIVATION
  // ===================================================

  async function confirmToggleLearner() {
    if (!confirmAction || updatingId !== null) return;

    const { learner, nextStatus } = confirmAction;

    const learnerId = Number(
      getValue(learner, "userId", "learnerId")
    );

    if (!learnerId) {
      setError("Invalid learner ID.");
      setConfirmAction(null);
      return;
    }

    const globalActive = getBoolean(
      getValue(learner, "isActive")
    );

    const organizationActive = getBoolean(
      getValue(learner, "organizationIsActive")
    );

    if (!globalActive || !organizationActive) {
      setError(
        !globalActive
          ? "Only Super Admin can reactivate this globally deactivated account."
          : "This organization is inactive. Contact Super Admin."
      );

      setConfirmAction(null);
      return;
    }

    setUpdatingId(learnerId);
    setError("");
    setMessage("");

    try {
      await fetchApi(
        `UserManagement/organization-learners/${learnerId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      setConfirmAction(null);

      setMessage(
        `${getLearnerName(learner)} was ${
          nextStatus ? "activated" : "deactivated"
        } successfully.`
      );

      await loadLearners();
    } catch (err) {
      setError(err.message || "Could not update learner status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const confirmLearner = confirmAction?.learner;
  const confirmNextStatus = confirmAction?.nextStatus;

  const confirmLearnerId = confirmLearner
    ? Number(getValue(confirmLearner, "userId", "learnerId"))
    : null;

  // ===================================================
  // PAGE UI
  // ===================================================

  return (
    <DashboardLayout role="Admin" title="Learner Management">
      {/* PAGE HEADING */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
            Learner Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage learner accounts within your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLearners}
          disabled={loading || registering || updatingId !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#17233F] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <p className="min-w-0 flex-1 break-words">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <p className="min-w-0 flex-1 break-words">{message}</p>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss success message"
            className="rounded-lg p-1 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <section className="mb-6 grid gap-5 sm:grid-cols-3">
        {[
          {
            label: "Total Learners",
            value: learners.length,
            icon: Users,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Active Learners",
            value: activeCount,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Inactive Learners",
            value: inactiveCount,
            icon: XCircle,
            color: "bg-amber-50 text-amber-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <span className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={20} />
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17233F]">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </section>

      {/* =================================================
          REGISTER LEARNER FORM
          THIS FORM IS ABOVE THE TABLE
      ================================================= */}

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserPlus size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#17233F]">
              Register Learner
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a learner account for your organization.
            </p>
          </div>
        </div>

        <form onSubmit={registerLearner}>
          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            {/* FIRST NAME */}
            <div>
              <label
                htmlFor="learner-first-name"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                First Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="learner-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={registerForm.firstName}
                  onChange={handleRegisterChange}
                  placeholder="Enter first name"
                  required
                  maxLength={100}
                  disabled={registering}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* LAST NAME */}
            <div>
              <label
                htmlFor="learner-last-name"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Last Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="learner-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={registerForm.lastName}
                  onChange={handleRegisterChange}
                  placeholder="Enter last name"
                  required
                  maxLength={100}
                  disabled={registering}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="learner-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="learner-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="learner@example.com"
                  required
                  maxLength={254}
                  disabled={registering}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="learner-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="learner-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={registering}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Use a password that meets your backend&apos;s password policy.
              </p>
            </div>

            {/* PHONE */}
            <div>
              <label
                htmlFor="learner-phone"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Phone Number{" "}
                <span className="font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="learner-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={registerForm.phone}
                  onChange={handleRegisterChange}
                  placeholder="Enter phone number"
                  maxLength={30}
                  disabled={registering}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* ORGANIZATION NOTICE */}
            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:col-span-2">
              <Building2
                size={19}
                className="mt-0.5 shrink-0 text-indigo-600"
              />

              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  Organization assignment
                </p>

                <p className="mt-1 text-xs leading-5 text-indigo-800">
                  This learner will be registered under your organization
                  automatically. You do not need to select an organization.
                </p>
              </div>
            </div>
          </div>

          {/* FORM BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setRegisterForm({ ...EMPTY_FORM })}
              disabled={registering}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={registering}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registering ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Register Learner
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* =================================================
          LEARNER TABLE
          THIS TABLE IS BELOW THE FORM
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#17233F]">
              Organization Learners
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View learner details and manage organization-level access.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search learners..."
                aria-label="Search learners"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter learners by status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading learners...
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="py-14 text-center">
            <Users size={32} className="mx-auto mb-3 text-slate-300" />

            <p className="font-semibold text-[#17233F]">
              No learners found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try another search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Learner</th>
                  <th className="px-5 py-4 font-semibold">Organization</th>
                  <th className="px-5 py-4 font-semibold">Account Status</th>
                  <th className="px-5 py-4 font-semibold">Access</th>
                  <th className="px-5 py-4 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLearners.map((learner, index) => {
                  const id = Number(
                    getValue(learner, "userId", "learnerId")
                  );

                  const globalActive = getBoolean(
                    getValue(learner, "isActive")
                  );

                  const adminActive = getBoolean(
                    getValue(learner, "adminIsActive")
                  );

                  const organizationActive = getBoolean(
                    getValue(learner, "organizationIsActive")
                  );

                  const effectiveActive = getEffectiveStatus(learner);
                  const canManage = globalActive && organizationActive;
                  const isUpdating = updatingId === id;

                  return (
                    <tr
                      key={id || index}
                      className="transition hover:bg-slate-50/80"
                    >
                      {/* LEARNER INFORMATION */}
                      <td className="px-5 py-5">
                        <div className="font-semibold text-[#17233F]">
                          {getLearnerName(learner)}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={13} />
                          {getValue(learner, "email") || "No email"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          ID: {id || "—"}
                        </div>
                      </td>

                      {/* ORGANIZATION */}
                      <td className="px-5 py-5 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          {getValue(
                            learner,
                            "organizationName",
                            "organization"
                          ) || "Unassigned"}
                        </div>
                      </td>

                      {/* GLOBAL AND ORGANIZATION STATUS */}
                      <td className="px-5 py-5">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                              globalActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            Global: {globalActive ? "Active" : "Inactive"}
                          </span>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                                organizationActive
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              Organization:{" "}
                              {organizationActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* EFFECTIVE ACCESS */}
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            effectiveActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              effectiveActive
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />

                          {effectiveActive ? "Active" : "Inactive"}
                        </span>

                        {!globalActive && (
                          <p className="mt-1.5 text-xs text-slate-500">
                            Restricted by Super Admin
                          </p>
                        )}

                        {globalActive && !organizationActive && (
                          <p className="mt-1.5 text-xs text-slate-500">
                            Organization inactive
                          </p>
                        )}

                        {globalActive &&
                          organizationActive &&
                          !adminActive && (
                            <p className="mt-1.5 text-xs text-slate-500">
                              Deactivated by Admin
                            </p>
                          )}
                      </td>

                      {/* ACTIVATION / DEACTIVATION SWITCH */}
                      <td className="px-5 py-5">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={adminActive}
                            aria-label={`${
                              adminActive ? "Deactivate" : "Activate"
                            } ${getLearnerName(learner)}`}
                            title={
                              !globalActive
                                ? "Super Admin must reactivate this account first"
                                : !organizationActive
                                  ? "Organization must be active first"
                                  : adminActive
                                    ? "Deactivate learner"
                                    : "Activate learner"
                            }
                            onClick={() => toggleLearner(learner)}
                            disabled={
                              !canManage ||
                              updatingId !== null ||
                              confirmAction !== null ||
                              !id
                            }
                            className="group inline-flex items-center justify-center rounded-full outline-none transition focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span
                              className={`relative inline-flex h-7 w-[54px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200 ${
                                adminActive
                                  ? "bg-emerald-500 group-hover:bg-emerald-600"
                                  : "bg-slate-300 group-hover:bg-slate-400"
                              }`}
                            >
                              {isUpdating && (
                                <LoaderCircle
                                  size={18}
                                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-spin text-white"
                                />
                              )}

                              <span
                                className={`h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  adminActive
                                    ? "translate-x-[26px]"
                                    : "translate-x-0"
                                } ${isUpdating ? "opacity-30" : ""}`}
                              />
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* VIEW DETAILS */}
                      <td className="px-5 py-5">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedLearner(learner)}
                            aria-label={`View details for ${getLearnerName(
                              learner
                            )}`}
                            title="View learner details"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                          >
                            <Eye size={21} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6">
          Showing {filteredLearners.length} of {learners.length} learners
        </div>
      </section>

      {/* ACCESS POLICY */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
        <ShieldCheck size={20} className="mt-0.5 shrink-0" />

        <p>
          <span className="font-semibold">Access policy:</span>{" "}
          Admins can manage learners in their own organization only. A Super
          Admin&apos;s global deactivation and an inactive organization cannot
          be overridden from this page.
        </p>
      </div>

      {/* =================================================
          VIEW LEARNER DETAILS DIALOG
      ================================================= */}

      {selectedLearner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLearner(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="learner-details-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {getInitials(getLearnerName(selectedLearner))}
                </div>

                <div>
                  <h2
                    id="learner-details-title"
                    className="text-lg font-bold text-[#17233F]"
                  >
                    Learner Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Full information available for this learner account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLearner(null)}
                aria-label="Close learner details"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-[#17233F]">
                  {getLearnerName(selectedLearner)}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {getValue(selectedLearner, "email") || "No email available"}
                </p>
              </div>

              {/* Learner ID and Role removed; all other details retained. */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* <DetailItem
                  icon={Mail}
                  label="Email"
                  value={getValue(selectedLearner, "email")}
                /> */}

                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={getValue(
                    selectedLearner,
                    "phone",
                    "phoneNumber"
                  )}
                />

                <DetailItem
                  icon={Building2}
                  label="Organization"
                  value={getValue(
                    selectedLearner,
                    "organizationName",
                    "organization"
                  )}
                />

                <DetailItem
                  icon={ShieldCheck}
                  label="Global Account"
                  value={
                    getBoolean(getValue(selectedLearner, "isActive"))
                      ? "Active"
                      : "Inactive"
                  }
                />

                <DetailItem
                  icon={ShieldCheck}
                  label="Organization Status"
                  value={
                    getBoolean(
                      getValue(selectedLearner, "organizationIsActive")
                    )
                      ? "Active"
                      : "Inactive"
                  }
                />

                <DetailItem
                  icon={ShieldCheck}
                  label="Admin Access"
                  value={
                    getBoolean(getValue(selectedLearner, "adminIsActive"))
                      ? "Active"
                      : "Inactive"
                  }
                />

                {/* CREATED AT */}
                <DetailItem
                  icon={CalendarDays}
                  label="Created At"
                  value={formatDate(getCreatedAtValue(selectedLearner))}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLearner(null)}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =================================================
          ACTIVATION / DEACTIVATION CONFIRMATION DIALOG
      ================================================= */}

      {confirmAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              updatingId === null
            ) {
              setConfirmAction(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="learner-confirm-title"
            aria-describedby="learner-confirm-description"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    confirmNextStatus
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {confirmNextStatus ? (
                    <CheckCircle2 size={23} />
                  ) : (
                    <AlertTriangle size={23} />
                  )}
                </div>

                <div>
                  <h2
                    id="learner-confirm-title"
                    className="text-lg font-bold text-[#17233F]"
                  >
                    {confirmNextStatus
                      ? "Activate learner?"
                      : "Deactivate learner?"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Please confirm this change.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={updatingId !== null}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p
                id="learner-confirm-description"
                className="text-sm leading-6 text-slate-600"
              >
                Are you sure you want to{" "}
                <span
                  className={`font-semibold ${
                    confirmNextStatus ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {confirmNextStatus ? "activate" : "deactivate"}
                </span>{" "}
                <span className="font-semibold text-[#17233F]">
                  {getLearnerName(confirmLearner)}
                </span>
                ?
              </p>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {getInitials(getLearnerName(confirmLearner))}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#17233F]">
                      {getLearnerName(confirmLearner)}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {getValue(confirmLearner, "email") || "No email"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Learner ID: {confirmLearnerId || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                {confirmNextStatus
                  ? "The learner will regain organization-level access, provided their global account and organization are active."
                  : "The learner's organization-level access will be disabled. Their account will remain in the system."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={updatingId !== null}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmToggleLearner}
                disabled={updatingId !== null}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmNextStatus
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {updatingId !== null ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : confirmNextStatus ? (
                  <ToggleRight size={18} />
                ) : (
                  <ToggleLeft size={18} />
                )}

                {updatingId !== null
                  ? "Updating..."
                  : confirmNextStatus
                    ? "Yes, Activate"
                    : "Yes, Deactivate"}
              </button>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
