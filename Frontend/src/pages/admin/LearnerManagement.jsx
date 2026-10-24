
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  ShieldCheck,
  LoaderCircle,
  UserPlus,
  UserRound,
  LockKeyhole,
  Phone,
  Eye,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  X,
  ShieldAlert,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const PAGE_SIZE = 10;

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";

const getToken = () => localStorage.getItem("skillmesh_token");

function normalizeRole(role) {
  return String(role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function getCurrentRole() {
  const token = getToken();

  if (token) {
    try {
      const payloadPart = token.split(".")[1];
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

      const payload = JSON.parse(
        atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))
      );

      const role =
        payload.role ??
        payload.roles ??
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      if (Array.isArray(role)) {
        return (
          role.find((item) => normalizeRole(item) === "superadmin") ||
          role.find((item) => normalizeRole(item) === "admin") ||
          role[0] ||
          ""
        );
      }

      if (typeof role === "string" && role) return role;
    } catch {
      // Fall back to the saved role if the token cannot be parsed.
    }
  }

  return (
    localStorage.getItem("skillmesh_role") ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("role") ||
    ""
  );
}

function isSuperAdminRole(role) {
  return normalizeRole(role) === "superadmin";
}

async function fetchApi(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  const result = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      result?.message ||
      result?.Message ||
      result?.title ||
      (typeof result === "string" && result) ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return result;
}

function read(object, ...keys) {
  if (!object) return undefined;

  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }

    const foundKey = Object.keys(object).find(
      (item) => item.toLowerCase() === key.toLowerCase()
    );

    if (
      foundKey &&
      object[foundKey] !== undefined &&
      object[foundKey] !== null
    ) {
      return object[foundKey];
    }
  }

  return undefined;
}

function getArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.learners)) return data.learners;
  return [];
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  if (typeof value === "string") {
    return ["true", "1", "yes", "active"].includes(
      value.trim().toLowerCase()
    );
  }

  return false;
}

function getName(learner) {
  const firstName = read(learner, "firstName") || "";
  const lastName = read(learner, "lastName") || "";

  return (
    `${firstName} ${lastName}`.trim() ||
    read(learner, "name", "fullName") ||
    "Unnamed Learner"
  );
}

function getInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "L"
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeLearner(item) {
  return {
    userId: Number(read(item, "userId", "id")),
    firstName: read(item, "firstName") || "",
    lastName: read(item, "lastName") || "",
    name: getName(item),
    email: read(item, "email") || "",
    phone: read(item, "phone") || "",
    roleId: Number(read(item, "roleId") ?? 3),
    roleName: read(item, "roleName") || "Learner",
    isActive: toBoolean(read(item, "isActive", "active")),
    deactivatedBySuperAdmin: toBoolean(
      read(item, "deactivatedBySuperAdmin")
    ),
    createdAt: read(item, "createdAt", "createdOn", "registrationDate"),
  };
}

export default function LearnerManagement() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [loadError, setLoadError] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState(emptyForm);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [currentRole, setCurrentRole] = useState(getCurrentRole);

  const isSuperAdmin = isSuperAdminRole(currentRole);

  const loadLearners = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError("");

    try {
      const result = await fetchApi("/api/UserManagement/learners");

      const onlyLearners = getArray(result)
        .map(normalizeLearner)
        .filter((learner) => learner.roleId === 3)
        .sort((a, b) => b.userId - a.userId);

      setLearners(onlyLearners);

      // Keep the open details modal in sync with the refreshed data.
      setSelectedLearner((current) => {
        if (!current) return null;

        return (
          onlyLearners.find(
            (learner) => learner.userId === current.userId
          ) || null
        );
      });
    } catch (error) {
      setLoadError(error.message || "Unable to load learners.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setCurrentRole(getCurrentRole());
    loadLearners();
  }, [loadLearners]);

  useEffect(() => {
    if (!selectedLearner) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedLearner(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLearner]);

  const filteredLearners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return learners.filter((learner) => {
      const matchesSearch =
        !query ||
        learner.name.toLowerCase().includes(query) ||
        learner.email.toLowerCase().includes(query) ||
        String(learner.userId).includes(query) ||
        learner.phone.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && learner.isActive) ||
        (statusFilter === "inactive" && !learner.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [learners, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLearners.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedLearners = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredLearners.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLearners, safePage]);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const activeCount = learners.filter((learner) => learner.isActive).length;
  const inactiveCount = learners.length - activeCount;

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegistrationMessage(null);

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setRegistrationMessage({
        type: "error",
        text: "Please complete all required fields.",
      });
      return;
    }

    setRegistering(true);

    try {
      await fetchApi("/api/Auth/register/learner", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || null,
        }),
      });

      setForm(emptyForm);
      setSearch("");
      setStatusFilter("all");
      setCurrentPage(1);

      setRegistrationMessage({
        type: "success",
        text: "Learner registered successfully.",
      });

      await loadLearners();
    } catch (error) {
      setRegistrationMessage({
        type: "error",
        text: error.message || "Unable to register learner.",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleToggleStatus = async (learner) => {
    if (updatingUserId !== null) return;

    const nextStatus = !learner.isActive;

    /*
     * Permission rules:
     * 1. Super Admin can activate or deactivate any learner.
     * 2. Admin can deactivate active learners.
     * 3. Admin can reactivate a learner previously deactivated by Admin.
     * 4. Admin cannot reactivate a learner deactivated by Super Admin.
     */
    if (
      !isSuperAdmin &&
      nextStatus &&
      learner.deactivatedBySuperAdmin
    ) {
      setStatusMessage({
        type: "error",
        text:
          "Only Super Admin can reactivate this learner because Super Admin deactivated the account.",
      });
      return;
    }

    setStatusMessage(null);
    setUpdatingUserId(learner.userId);

    try {
      await fetchApi(
        `/api/UserManagement/learners/${learner.userId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ isActive: nextStatus }),
        }
      );

      /*
       * Optimistic update:
       * - Activation clears the Super Admin deactivation flag.
       * - Super Admin deactivation sets the flag.
       * - Admin deactivation clears the flag.
       *
       * The subsequent reload retrieves the authoritative database state.
       */
      const updatedLearner = {
        ...learner,
        isActive: nextStatus,
        deactivatedBySuperAdmin: nextStatus ? false : isSuperAdmin,
      };

      setLearners((current) =>
        current.map((item) =>
          item.userId === learner.userId ? updatedLearner : item
        )
      );

      setSelectedLearner((current) =>
        current?.userId === learner.userId ? updatedLearner : current
      );

      setStatusMessage({
        type: "success",
        text: nextStatus
          ? `${learner.name} has been activated successfully.`
          : isSuperAdmin
            ? `${learner.name} has been deactivated by Super Admin.`
            : `${learner.name} has been deactivated by Admin.`,
      });

      // Reload to ensure the UI matches the saved database values.
      await loadLearners(true);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "Unable to update learner status.",
      });

      await loadLearners(true);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const firstItem =
    filteredLearners.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    safePage * PAGE_SIZE,
    filteredLearners.length
  );

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-6 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
              <Users size={15} />
              User Administration
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Learner Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Register learner accounts, review learner details, and manage
              account status according to your role.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentRole(getCurrentRole());
              loadLearners(true);
            }}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-center"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {loadError && (
          <MessageBanner
            type="error"
            message={loadError}
            onClose={() => setLoadError("")}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Learners"
            value={learners.length}
            description="All learner accounts"
            icon={<Users size={21} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            title="Active Learners"
            value={activeCount}
            description="Currently active"
            icon={<UserCheck size={21} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Inactive Learners"
            value={inactiveCount}
            description="Currently inactive"
            icon={<UserX size={21} />}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Registration */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Register New Learner
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Create a learner account using the details below.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            {registrationMessage && (
              <MessageBanner
                type={registrationMessage.type}
                message={registrationMessage.text}
                onClose={() => setRegistrationMessage(null)}
              />
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="First Name" required>
                  <IconInput icon={<UserRound size={16} />}>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleFormChange}
                      placeholder="Enter first name"
                      autoComplete="given-name"
                      required
                      className={`${inputClass} pl-9`}
                    />
                  </IconInput>
                </FormField>

                <FormField label="Last Name" required>
                  <IconInput icon={<UserRound size={16} />}>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleFormChange}
                      placeholder="Enter last name"
                      autoComplete="family-name"
                      required
                      className={`${inputClass} pl-9`}
                    />
                  </IconInput>
                </FormField>

                <FormField label="Email Address" required>
                  <IconInput icon={<Mail size={16} />}>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      placeholder="learner@example.com"
                      autoComplete="email"
                      required
                      className={`${inputClass} pl-9`}
                    />
                  </IconInput>
                </FormField>

                <FormField label="Phone Number">
                  <IconInput icon={<Phone size={16} />}>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      placeholder="Enter phone number"
                      autoComplete="tel"
                      className={`${inputClass} pl-9`}
                    />
                  </IconInput>
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Password" required>
                    <IconInput icon={<LockKeyhole size={16} />}>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleFormChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className={`${inputClass} pl-9`}
                      />
                    </IconInput>
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  <span className="text-red-500">*</span> Required fields
                </p>

                <button
                  type="submit"
                  disabled={registering}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registering ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <UserPlus size={17} />
                  )}
                  {registering ? "Registering..." : "Register Learner"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Learner list */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Learner Accounts
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, and view learner account details.
                </p>
              </div>

              {!isSuperAdmin && (
                <span className="inline-flex items-center gap-2 self-start rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  <ShieldAlert size={15} />
                  Admin can reactivate Admin-deactivated learners only
                </span>
              )}
            </div>

            {statusMessage && (
              <MessageBanner
                type={statusMessage.type}
                message={statusMessage.text}
                onClose={() => setStatusMessage(null)}
              />
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, email, phone, or ID..."
                  aria-label="Search learners"
                  className={`${inputClass} pl-9`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter learners by status"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="inline-flex items-center justify-center rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600">
                {filteredLearners.length} result
                {filteredLearners.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle
                size={22}
                className="animate-spin text-indigo-600"
              />
              Loading learner accounts...
            </div>
          ) : filteredLearners.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Users size={24} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No learners found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "Registered learner accounts will appear here."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] table-fixed text-left">
                  <colgroup>
                    <col className="w-[23%]" />
                    <col className="w-[25%]" />
                    <col className="w-[15%]" />
                    <col className="w-[13%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                  </colgroup>

                  <thead className="bg-slate-50">
                    <tr className="border-y border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3.5">Learner</th>
                      <th className="px-4 py-3.5">Contact</th>
                      <th className="px-4 py-3.5">Registered</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-center">Manage</th>
                      <th className="px-4 py-3.5 text-right">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedLearners.map((learner) => {
                      const updating = updatingUserId === learner.userId;

                      const adminCannotActivate =
                        !isSuperAdmin &&
                        !learner.isActive &&
                        learner.deactivatedBySuperAdmin;

                      const toggleDisabled =
                        adminCannotActivate ||
                        updating ||
                        updatingUserId !== null;

                      return (
                        <tr
                          key={learner.userId}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-4 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
                                {getInitials(learner.name)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {learner.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  ID #{learner.userId}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p
                              className="flex items-center gap-2 truncate text-sm text-slate-700"
                              title={learner.email}
                            >
                              <Mail
                                size={14}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="truncate">
                                {learner.email || "—"}
                              </span>
                            </p>

                            {learner.phone && (
                              <p className="mt-1.5 flex items-center gap-2 truncate text-xs text-slate-500">
                                <Phone
                                  size={13}
                                  className="shrink-0 text-slate-400"
                                />
                                <span className="truncate">
                                  {learner.phone}
                                </span>
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />
                              {formatDate(learner.createdAt)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start gap-1.5">
                              <StatusBadge active={learner.isActive} />

                              {!learner.isActive &&
                                learner.deactivatedBySuperAdmin && (
                                  <span
                                    title="This learner was deactivated by Super Admin."
                                    className="inline-flex max-w-full items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-semibold leading-4 text-rose-700 ring-1 ring-inset ring-rose-200"
                                  >
                                    <ShieldAlert
                                      size={12}
                                      className="shrink-0"
                                    />
                                    Deactivated by Super Admin
                                  </span>
                                )}

                              {!learner.isActive &&
                                !learner.deactivatedBySuperAdmin && (
                                  <span className="text-[10px] text-slate-400">
                                    Deactivated by Admin or another process
                                  </span>
                                )}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center gap-1.5">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={learner.isActive}
                                aria-label={`${
                                  learner.isActive ? "Deactivate" : "Activate"
                                } ${learner.name}`}
                                title={
                                  isSuperAdmin
                                    ? `Click to ${
                                        learner.isActive
                                          ? "deactivate"
                                          : "activate"
                                      } learner`
                                    : learner.isActive
                                      ? "Admin can deactivate this learner"
                                      : learner.deactivatedBySuperAdmin
                                        ? "Only Super Admin can reactivate this learner"
                                        : "Click to reactivate this Admin-deactivated learner"
                                }
                                disabled={toggleDisabled}
                                onClick={() => handleToggleStatus(learner)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                                  learner.isActive
                                    ? "bg-emerald-500 focus:ring-emerald-100"
                                    : "bg-slate-300 focus:ring-slate-100"
                                }`}
                              >
                                <span
                                  className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
                                    learner.isActive
                                      ? "translate-x-[22px]"
                                      : "translate-x-[3px]"
                                  }`}
                                />
                              </button>

                              <span className="text-[11px] font-medium text-slate-500">
                                {updating
                                  ? "Updating..."
                                  : learner.isActive
                                    ? "Active"
                                    : "Inactive"}
                              </span>

                              {!isSuperAdmin &&
                                !learner.isActive &&
                                learner.deactivatedBySuperAdmin && (
                                  <span className="max-w-24 text-center text-[10px] leading-4 text-rose-600">
                                    Super Admin only
                                  </span>
                                )}

                              {!isSuperAdmin &&
                                !learner.isActive &&
                                !learner.deactivatedBySuperAdmin && (
                                  <span className="max-w-28 text-center text-[10px] leading-4 text-indigo-600">
                                    Admin can reactivate
                                  </span>
                                )}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLearner(learner)}
                              title="View learner details"
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {firstItem}–{lastItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredLearners.length}
                  </span>{" "}
                  learners
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safePage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  {getPageNumbers(safePage, totalPages).map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1.5 text-xs text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        aria-current={
                          safePage === page ? "page" : undefined
                        }
                        className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                          safePage === page
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safePage === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm leading-6 text-indigo-800">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <p>
            {isSuperAdmin
              ? "You can activate and deactivate any learner. The backend records whether an inactive learner was deactivated by Super Admin."
              : "You can deactivate active learners and reactivate learners deactivated by Admin. Learners deactivated by Super Admin can only be reactivated by Super Admin."}
          </p>
        </div>
      </div>

      {selectedLearner && (
        <Modal
          title="Learner Details"
          onClose={() => setSelectedLearner(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-base font-bold text-indigo-700">
                {getInitials(selectedLearner.name)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="break-words text-base font-bold text-slate-900">
                  {selectedLearner.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Learner ID #{selectedLearner.userId}
                </p>

                <div className="mt-2">
                  <StatusBadge active={selectedLearner.isActive} />
                </div>

                {!selectedLearner.isActive &&
                  selectedLearner.deactivatedBySuperAdmin && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                      <ShieldAlert size={14} />
                      Deactivated by Super Admin
                    </p>
                  )}

                {!selectedLearner.isActive &&
                  !selectedLearner.deactivatedBySuperAdmin && (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Not marked as deactivated by Super Admin
                    </p>
                  )}
              </div>
            </div>

            <DetailRow
              icon={<Mail size={16} />}
              label="Email Address"
              value={selectedLearner.email || "—"}
            />

            <DetailRow
              icon={<Phone size={16} />}
              label="Phone Number"
              value={selectedLearner.phone || "—"}
            />

            <DetailRow
              icon={<CalendarDays size={16} />}
              label="Registration Date"
              value={formatDate(selectedLearner.createdAt)}
            />

            <DetailRow
              icon={<ShieldCheck size={16} />}
              label="Account Status"
              value={
                selectedLearner.isActive
                  ? "Active"
                  : selectedLearner.deactivatedBySuperAdmin
                    ? "Inactive — Deactivated by Super Admin"
                    : "Inactive"
              }
            />

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedLearner(null)}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

function StatCard({ title, value, icon, iconClass, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function IconInput({ icon, children }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      {children}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function MessageBanner({ type, message, onClose }) {
  const success = type === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}

      <p className="flex-1 leading-6">{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
        className="rounded-md p-0.5 opacity-70 transition hover:opacity-100"
      >
        <XCircle size={17} />
      </button>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-6"
        style={{ maxHeight: "min(88dvh, 620px)" }}
      >
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Learner account
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
