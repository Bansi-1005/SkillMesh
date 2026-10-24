import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  UserPlus,
  LockKeyhole,
  UserRound,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Power,
  X,
  AlertTriangle,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  role: "Learner",
};

function getAccessToken() {
  return (
    localStorage.getItem("skillmesh_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function valueOf(object, camel, pascal) {
  return object?.[camel] ?? object?.[pascal];
}

function getUserId(user) {
  return valueOf(user, "userId", "UserId") ??
    valueOf(user, "id", "Id");
}

function getFirstName(user) {
  return valueOf(user, "firstName", "FirstName") ?? "";
}

function getLastName(user) {
  return valueOf(user, "lastName", "LastName") ?? "";
}

function getFullName(user) {
  return (
    `${getFirstName(user)} ${getLastName(user)}`.trim() ||
    "Unnamed User"
  );
}

function getEmail(user) {
  return valueOf(user, "email", "Email") ?? "";
}

function getPhone(user) {
  return valueOf(user, "phone", "Phone") ?? "";
}

function getRole(user) {
  const roleId = valueOf(user, "roleId", "RoleId");

  const rawRole = String(
    valueOf(user, "roleName", "RoleName") ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (rawRole === "superadmin" || Number(roleId) === 1) {
    return "Super Admin";
  }

  if (rawRole === "admin" || Number(roleId) === 2) {
    return "Admin";
  }

  if (rawRole === "learner" || Number(roleId) === 3) {
    return "Learner";
  }

  return valueOf(user, "roleName", "RoleName") ?? "Unknown";
}

function isActive(user) {
  const value = valueOf(user, "isActive", "IsActive");

  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  );
}

function getCreatedDate(user) {
  const value = valueOf(user, "createdAt", "CreatedAt");

  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
}

function getErrorMessage(data, fallback) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (data?.detail) return data.detail;
  if (data?.title) return data.title;

  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors)
      .flat()
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return fallback;
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Success message component.
function SuccessMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
    >
      <CheckCircle2
        size={19}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="font-semibold">Success</p>
        <p className="mt-0.5 break-words">{message}</p>
        <p className="mt-1 text-xs text-emerald-700">
          This message will disappear automatically.
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss success message"
        className="rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-100"
      >
        <X size={17} />
      </button>
    </div>
  );
}

// Error message component.
function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
    >
      <AlertCircle
        size={19}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="break-words">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  // Separate success messages.
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [tableSuccess, setTableSuccess] = useState("");

  const [confirmUser, setConfirmUser] = useState(null);

  // NEW: Automatically dismiss the registration success message
  // 4 seconds after it appears or changes.
  useEffect(() => {
    if (!registrationSuccess) return undefined;

    const timeoutId = window.setTimeout(() => {
      setRegistrationSuccess("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [registrationSuccess]);

  // NEW: Automatically dismiss the table success message
  // 4 seconds after it appears or changes.
  useEffect(() => {
    if (!tableSuccess) return undefined;

    const timeoutId = window.setTimeout(() => {
      setTableSuccess("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [tableSuccess]);

  // Load users from the backend.
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setListError("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please log in again as Super Admin."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/UserManagement/users`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : response.status === 403
              ? "Only a Super Admin can view all platform users."
              : getErrorMessage(data, "Could not load users.")
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "The users API did not return an array. Check the endpoint in Swagger."
        );
      }

      setUsers(data);
    } catch (err) {
      setListError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check the API URL and whether the backend is running."
          : err.message || "Could not load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setRegistrationSuccess("");
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setError("");
    setRegistrationSuccess("");
  }

  // Open the confirmation modal before changing user status.
  function handleToggleStatus(user) {
    const role = getRole(user);
    const userId = getUserId(user);

    if (role === "Super Admin") {
      setListError(
        "Super Admin accounts cannot be changed here."
      );
      return;
    }

    if (userId === null || userId === undefined) {
      setListError(
        "Cannot update status because the user ID is missing."
      );
      return;
    }

    if (updatingUserId !== null) return;

    setListError("");
    setTableSuccess("");
    setConfirmUser(user);
  }

  // Activate or deactivate a user.
  async function confirmToggleStatus() {
    if (!confirmUser) return;

    const user = confirmUser;
    const userId = getUserId(user);
    const nextStatus = !isActive(user);

    setUpdatingUserId(userId);
    setListError("");
    setTableSuccess("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Please log in again as Super Admin."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/UserManagement/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : response.status === 403
              ? "Only a Super Admin can change user status."
              : getErrorMessage(
                  data,
                  "Could not update user status."
                )
        );
      }

      setConfirmUser(null);

      // Show the table success message.
      setTableSuccess(
        `${getFullName(user)} has been ${
          nextStatus ? "activated" : "deactivated"
        } successfully.`
      );

      await loadUsers();
    } catch (err) {
      setConfirmUser(null);

      setListError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check the API URL and whether the backend is running."
          : err.message || "Could not update user status."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  // Register an Admin or independent Learner.
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setRegistrationSuccess("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const selectedRole = form.role;

    if (!firstName || !lastName || !email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError("Please log in again as Super Admin.");
      return;
    }

    const endpoint =
      selectedRole === "Admin"
        ? "/api/Auth/register/admin"
        : "/api/Auth/register/learner";

    // No OrganizationId is sent.
    const payload = {
      firstName,
      lastName,
      email,
      password: form.password,
      phone: phone || null,
    };

    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : response.status === 403
              ? "You are not authorized to create this account. Sign in as Super Admin."
              : getErrorMessage(
                  data,
                  `Could not register the ${selectedRole}.`
                )
        );
      }

      // Show the registration success message.
      setRegistrationSuccess(
        getErrorMessage(
          data,
          `${selectedRole} registered successfully.`
        )
      );

      setForm(EMPTY_FORM);
      setCurrentPage(1);

      // Refresh the user table.
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check the API URL, backend and CORS settings."
          : err.message ||
              `Could not register the ${selectedRole}.`
      );
    } finally {
      setSaving(false);
    }
  }

  // Search and filter users.
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const searchableText = [
        getUserId(user),
        getFullName(user),
        getEmail(user),
        getPhone(user),
        getRole(user),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const matchesRole =
        roleFilter === "All" ||
        getRole(user) === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && isActive(user)) ||
        (statusFilter === "Inactive" && !isActive(user));

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter(isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  const countRole = (role) =>
    users.filter((user) => getRole(user) === role).length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedUsers = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredUsers.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredUsers, safeCurrentPage]);

  const firstRecord =
    filteredUsers.length === 0
      ? 0
      : (safeCurrentPage - 1) * PAGE_SIZE + 1;

  const lastRecord = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredUsers.length
  );

  const confirmIsActive = confirmUser
    ? isActive(confirmUser)
    : false;

  const confirmAction = confirmIsActive
    ? "deactivate"
    : "activate";

  return (
    <DashboardLayout
      role="Super Admin"
      title="User Management"
    >
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Platform administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#17233F]">
            User Management
          </h1>

          <p className="mt-2 text-slate-500">
            Register, view, and manage Admin and Learner accounts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
          <ShieldCheck size={19} />
          Super Admin access
        </div>
      </div>

      {/* Summary cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Users",
            value: totalUsers,
            icon: Users,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Super Admins",
            value: countRole("Super Admin"),
            icon: ShieldCheck,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Administrators",
            value: countRole("Admin"),
            icon: UserRound,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Learners",
            value: countRole("Learner"),
            icon: Users,
            color: "bg-amber-50 text-amber-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {label}
              </p>

              <span className={`rounded-xl p-2 ${color}`}>
                <Icon size={19} />
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17233F]">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </section>

      {/* Registration form */}
      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <UserPlus size={22} />
          </span>

          <div>
            <h2 className="text-xl font-bold text-[#17233F]">
              Register a User
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create an Admin or Learner account for SkillMesh.
            </p>
          </div>
        </div>

        <SuccessMessage
          message={registrationSuccess}
          onDismiss={() => setRegistrationSuccess("")}
        />

        <ErrorMessage message={error} />

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Account Role *
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Learner">Learner</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                First Name *
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Last Name *
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                maxLength={100}
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address *
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Optional phone number"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Temporary Password *
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                The backend must hash the password before saving it.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Users learn independently. No organization selection is
            required. Super Admin accounts cannot be registered from
            this form.
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={clearForm}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#5540F5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Register {form.role}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Users table */}
      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#17233F]">
              All Platform Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View account details and manage Admin and Learner status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading || updatingUserId !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <SuccessMessage
          message={tableSuccess}
          onDismiss={() => setTableSuccess("")}
        />

        <ErrorMessage
          message={listError}
          onRetry={loadUsers}
        />

        {/* Search and filters */}
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter users by role"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="All">All roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Learner">Learner</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter users by status"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>
            <strong className="text-emerald-700">
              {activeUsers}
            </strong>{" "}
            active
          </span>

          <span>
            <strong className="text-rose-700">
              {inactiveUsers}
            </strong>{" "}
            inactive
          </span>

          <span>
            Showing{" "}
            <strong className="text-[#17233F]">
              {firstRecord}-{lastRecord}
            </strong>{" "}
            of{" "}
            <strong className="text-[#17233F]">
              {filteredUsers.length}
            </strong>{" "}
            matching users
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />
            Loading users...
          </div>
        )}

        {!loading && !listError && (
          <>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user, index) => {
                    const role = getRole(user);
                    const active = isActive(user);
                    const userId = getUserId(user);
                    const isSuperAdmin = role === "Super Admin";

                    return (
                      <tr
                        key={userId ?? index}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 font-semibold text-[#17233F]">
                          {getFullName(user)}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {getEmail(user) || "—"}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {getPhone(user) || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                              isSuperAdmin
                                ? "bg-purple-50 text-purple-700"
                                : role === "Admin"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {role}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {isSuperAdmin ? (
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                                active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  active
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />
                              {active ? "Active" : "Inactive"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              role="switch"
                              aria-checked={active}
                              aria-label={`Change status for ${getFullName(user)}`}
                              onClick={() => handleToggleStatus(user)}
                              disabled={updatingUserId !== null}
                              title={
                                active
                                  ? "Deactivate this user"
                                  : "Activate this user"
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5540F5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                active
                                  ? "bg-emerald-500"
                                  : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                  active
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {getCreatedDate(user)}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        {users.length === 0
                          ? "No users were returned by the API."
                          : "No users match the selected search and filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <strong className="text-[#17233F]">
                    {safeCurrentPage}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-[#17233F]">
                    {totalPages}
                  </strong>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    disabled={safeCurrentPage <= 1}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safeCurrentPage >= totalPages}
                    className="flex items-center gap-1 rounded-xl bg-[#5540F5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Activate / Deactivate confirmation modal */}
      {confirmUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              updatingUserId === null
            ) {
              setConfirmUser(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
          >
            <div
              className={`flex items-start justify-between border-b px-6 py-5 ${
                confirmIsActive
                  ? "border-rose-100 bg-rose-50/80"
                  : "border-emerald-100 bg-emerald-50/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    confirmIsActive
                      ? "bg-rose-100 text-rose-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {confirmIsActive ? (
                    <AlertTriangle size={22} />
                  ) : (
                    <Power size={22} />
                  )}
                </div>

                <div>
                  <h2
                    id="status-modal-title"
                    className="text-lg font-bold text-[#17233F]"
                  >
                    {confirmIsActive
                      ? "Deactivate User"
                      : "Activate User"}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Please confirm this action
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmUser(null)}
                disabled={updatingUserId !== null}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to{" "}
                <strong
                  className={
                    confirmIsActive
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }
                >
                  {confirmAction}
                </strong>{" "}
                this account?
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {getFirstName(confirmUser).charAt(0).toUpperCase()}
                  {getLastName(confirmUser).charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#17233F]">
                    {getFullName(confirmUser)}
                  </p>

                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {getEmail(confirmUser)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {getRole(confirmUser)}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        confirmIsActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      Currently{" "}
                      {confirmIsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                {confirmIsActive
                  ? "Deactivating this account should prevent the user from accessing SkillMesh once the backend enforces inactive account status."
                  : "Activating this account will mark it as active in the system."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmUser(null)}
                disabled={updatingUserId !== null}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmToggleStatus}
                disabled={updatingUserId !== null}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmIsActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {updatingUserId !== null ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <Power size={16} />
                    Yes, {confirmAction}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}