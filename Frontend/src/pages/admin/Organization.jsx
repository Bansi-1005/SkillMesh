import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  X,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

// API configuration: uses the base URL from your .env file.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const API_ENDPOINT = `${API_BASE_URL}/api/Organization`;

// Default form values used when creating a new organization.
const emptyForm = {
  organizationName: "",
  organizationCode: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  isActive: true,
};

// Safely read properties regardless of whether the API returns
// PascalCase (OrganizationName) or camelCase (organizationName).
function getValue(item, ...keys) {
  for (const key of keys) {
    const matchedKey = Object.keys(item || {}).find(
      (itemKey) => itemKey.toLowerCase() === key.toLowerCase(),
    );

    if (matchedKey && item[matchedKey] != null) {
      return item[matchedKey];
    }
  }

  return "";
}

// Handles APIs that return either an array or an object containing data/items.
function getArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.organizations)) return response.organizations;

  return [];
}

// Convert API responses into a consistent format for the UI.
function normalizeOrganization(item) {
  return {
    organizationId: getValue(item, "organizationId", "id"),
    organizationName: getValue(item, "organizationName"),
    organizationCode: getValue(item, "organizationCode"),
    email: getValue(item, "email"),
    phone: getValue(item, "phone"),
    address: getValue(item, "address"),
    city: getValue(item, "city"),
    state: getValue(item, "state"),
    country: getValue(item, "country"),
    isActive:
      getValue(item, "isActive") === true ||
      getValue(item, "isActive") === 1 ||
      getValue(item, "isActive") === "true",
    createdAt: getValue(item, "createdAt"),
  };
}

function FormField({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#17233F] outline-none transition placeholder:text-slate-400 focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10"
      />
    </label>
  );
}

// Common API helper. Adds the login token and JSON headers to requests.
async function callOrganizationApi(url, options = {}) {
  const token = localStorage.getItem("skillmesh_token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Read the response as text first so empty responses do not cause JSON errors.
  const responseText = await response.text();

  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof responseData === "string"
        ? responseData
        : responseData?.message ||
          responseData?.Message ||
          responseData?.title ||
          `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return responseData;
}

export default function Organization({ role }) {
  const currentRole = (
    role ||
    localStorage.getItem("skillmesh_role") ||
    localStorage.getItem("role") ||
    ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const isSuperAdmin = currentRole === "superadmin";
  const isAdmin = currentRole === "admin";

  // Organizations returned by the backend.
  const [organizations, setOrganizations] = useState([]);

  // Loading, API error, and success-message states.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search and status filter states.
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal state: create, edit, or view an organization.
  const [modalType, setModalType] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // Form data and validation messages.
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // GET: Retrieve organizations from the backend.
  async function loadOrganizations() {
    setLoading(true);
    setError("");

    try {
      const response = await callOrganizationApi(API_ENDPOINT);
      const records = getArray(response).map(normalizeOrganization);

      setOrganizations(records);
    } catch (err) {
      setError(err.message || "Unable to load organizations.");
    } finally {
      setLoading(false);
    }
  }

  // Load organizations when the page first opens.
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Calculate organization statistics from the loaded data.
  const totalOrganizations = organizations.length;

  const activeOrganizations = organizations.filter(
    (organization) => organization.isActive,
  ).length;

  const inactiveOrganizations = totalOrganizations - activeOrganizations;

  // Search and filter the organization list without another API request.
  const filteredOrganizations = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return organizations.filter((organization) => {
      const matchesSearch = [
        organization.organizationName,
        organization.organizationCode,
        organization.email,
        organization.city,
        organization.country,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search),
      );

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && organization.isActive) ||
        (statusFilter === "Inactive" && !organization.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchText, statusFilter]);

  // Open the modal for creating a new organization.
  function openCreateModal() {
    if (!isSuperAdmin) return;

    setForm({ ...emptyForm });
    setSelectedOrganization(null);
    setFormError("");
    setError("");
    setSuccess("");
    setModalType("create");
  }

  // Open the modal with existing organization data for editing.
  function openEditModal(organization) {
    if (!isAdmin && !isSuperAdmin) return;

    setForm({
      organizationName: organization.organizationName || "",
      organizationCode: organization.organizationCode || "",
      email: organization.email || "",
      phone: organization.phone || "",
      address: organization.address || "",
      city: organization.city || "",
      state: organization.state || "",
      country: organization.country || "",
      isActive: organization.isActive,
    });

    setSelectedOrganization(organization);
    setFormError("");
    setError("");
    setSuccess("");
    setModalType("edit");
  }

  // Open a read-only modal to view organization details.
  function openViewModal(organization) {
    setSelectedOrganization(organization);
    setModalType("view");
  }

  // Close the create, edit, or view modal.
  function closeModal() {
    if (saving) return;

    setModalType("");
    setSelectedOrganization(null);
    setFormError("");
  }

  // Update form state whenever the user changes an input.
  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Basic client-side validation before sending data to the API.
  function validateForm() {
    if (!form.organizationName.trim()) {
      return "Organization name is required.";
    }

    if (!form.organizationCode.trim()) {
      return "Organization code is required.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  }

  // INSERT / CREATE: Send new organization data to the backend.
  // POST /api/Organization
  async function handleCreateOrganization(event) {
    event.preventDefault();

    if (!isSuperAdmin) {
      setFormError("Only Super Admin can create organizations.");
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setSaving(true);
    setFormError("");
    setError("");

    try {
      const payload = {
        organizationName: form.organizationName.trim(),
        organizationCode: form.organizationCode.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        isActive: form.isActive,
      };

      await callOrganizationApi(API_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setModalType("");
      setSuccess("Organization created successfully.");

      // Reload the list so the newly created record appears.
      await loadOrganizations();
    } catch (err) {
      setFormError(err.message || "Unable to create organization.");
    } finally {
      setSaving(false);
    }
  }

  // UPDATE: Send edited organization data to the backend.
  // PUT /api/Organization/{organizationId}
  async function handleUpdateOrganization(event) {
    event.preventDefault();

    if (!isAdmin && !isSuperAdmin) {
      setFormError("You are not allowed to edit organizations.");
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const organizationId = selectedOrganization?.organizationId;

    if (!organizationId) {
      setFormError("Organization ID is missing. Cannot update this record.");
      return;
    }

    setSaving(true);
    setFormError("");
    setError("");

    try {
      const payload = {
        organizationName: form.organizationName.trim(),
        organizationCode: form.organizationCode.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        isActive: isSuperAdmin ? form.isActive : selectedOrganization.isActive,
      };

      await callOrganizationApi(`${API_ENDPOINT}/${organizationId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setModalType("");
      setSelectedOrganization(null);
      setSuccess("Organization updated successfully.");

      // Reload the list to show the latest updated values.
      await loadOrganizations();
    } catch (err) {
      setFormError(err.message || "Unable to update organization.");
    } finally {
      setSaving(false);
    }
  }

  // UPDATE STATUS: Toggle an organization's Active/Inactive status directly
  // from the listing without opening the Edit Organization modal.
  // PUT /api/Organization/{organizationId}
  async function handleStatusToggle(organization) {
    if (!isSuperAdmin) {
      setError("Only Super Admin can change organization status.");
      return;
    }

    const organizationId = organization.organizationId;

    if (!organizationId) {
      setError("Organization ID is missing. Cannot update status.");
      return;
    }

    // Store the original status in case the API request fails.
    const newStatus = !organization.isActive;

    setError("");
    setSuccess("");

    // Update the UI immediately for a responsive experience.
    setOrganizations((previousOrganizations) =>
      previousOrganizations.map((item) =>
        item.organizationId === organizationId
          ? { ...item, isActive: newStatus }
          : item,
      ),
    );

    try {
      // Send the existing organization fields along with the new status.
      // This avoids unintentionally clearing other fields if the PUT API
      // expects a complete organization object.
      const payload = {
        organizationName: organization.organizationName,
        organizationCode: organization.organizationCode,
        email: organization.email,
        phone: organization.phone,
        address: organization.address,
        city: organization.city,
        state: organization.state,
        country: organization.country,
        isActive: newStatus,
      };

      await callOrganizationApi(`${API_ENDPOINT}/${organizationId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess(
        `${organization.organizationName} is now ${
          newStatus ? "Active" : "Inactive"
        }.`,
      );
    } catch (err) {
      // Roll back the displayed status if the API update fails.
      setOrganizations((previousOrganizations) =>
        previousOrganizations.map((item) =>
          item.organizationId === organizationId
            ? { ...item, isActive: !newStatus }
            : item,
        ),
      );

      setError(err.message || "Unable to update organization status.");
    }
  }

  // DELETE: Ask for confirmation before deleting an organization.
  // DELETE /api/Organization/{organizationId}

  function handleDeleteOrganization(organization) {
    if (!isSuperAdmin) {
      setError("Only Super Admin can delete organizations.");
      return;
    }

    // Open our custom confirmation modal.
    setDeleteTarget(organization);
    setError("");
    setSuccess("");
  }

  async function confirmDeleteOrganization() {
    if (!isSuperAdmin || !deleteTarget || deleting) return;

    const organization = deleteTarget;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await callOrganizationApi(
        `${API_ENDPOINT}/${organization.organizationId}`,
        { method: "DELETE" },
      );

      setDeleteTarget(null);
      setSuccess("Organization deleted successfully.");

      // Reload the list after successful deletion.
      await loadOrganizations();
    } catch (err) {
      setError(err.message || "Unable to delete organization.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function cancelDeleteOrganization() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  // Reusable status badge for Active and Inactive organizations.
  function StatusBadge({ active }) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-600"
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

  return (
    <DashboardLayout
      role={isSuperAdmin ? "Super Admin" : "Admin"}
      title="Organization"
    >
      {/* Page heading and primary action */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Building2 size={16} />
            <span>Administration</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
            Organization
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Create, view, and manage organizations on SkillMesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh: reload organization data from the API. */}
          <button
            type="button"
            onClick={loadOrganizations}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Create: open the INSERT form. */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5540F5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4632DC]"
            >
              <Plus size={17} />
              Add Organization
            </button>
          )}
        </div>
      </div>

      {/* Display API errors and successful CRUD operation messages. */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} />
          <span className="flex-1">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards: values are calculated from the API records. */}
      <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Organizations
            </p>
            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Building2 size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : totalOrganizations}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            All registered organizations
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Active Organizations
            </p>
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : activeOrganizations}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Currently active records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Inactive Organizations
            </p>
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <XCircle size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : inactiveOrganizations}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Currently inactive records
          </p>
        </div>
      </section>

      {/* Search and status filters apply to the already loaded records. */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#17233F]">Organizations</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading organizations..."
                : `${filteredOrganizations.length} organization${
                    filteredOrganizations.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search by organization name, code, email, city, or country. */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search organizations..."
                aria-label="Search organizations"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10 sm:w-64"
              />
            </div>

            {/* Filter the table by Active, Inactive, or All. */}
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#5540F5]"
            >
              <option value="All">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Organization data table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw size={25} className="mb-3 animate-spin text-[#5540F5]" />
            <p className="text-sm">Loading organizations...</p>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
              <Building2 size={30} />
            </div>
            <h3 className="font-semibold text-[#17233F]">
              No organizations found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {searchText || statusFilter !== "All"
                ? "Try changing your search text or status filter."
                : "Add your first organization to get started."}
            </p>

            {isSuperAdmin && !searchText && statusFilter === "All" && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5540F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4632DC]"
              >
                <Plus size={16} />
                Add Organization
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Organization</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredOrganizations.map((organization, index) => (
                  <tr
                    key={organization.organizationId || index}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEECFF] text-[#5540F5]">
                          <Building2 size={21} />
                        </div>

                        <div>
                          <p className="font-semibold text-[#17233F]">
                            {organization.organizationName ||
                              "Unnamed organization"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Code: {organization.organizationCode || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={14} className="shrink-0 text-slate-400" />
                        <span>{organization.email || "No email"}</span>
                      </div>

                      {organization.phone && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={13} className="shrink-0" />
                          <span>{organization.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />
                        <span>
                          {[
                            organization.city,
                            organization.state,
                            organization.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status column: show the current status and provide a direct toggle. */}
                    <td className="px-6 py-4">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={organization.isActive}
                          aria-label={`Change status for ${organization.organizationName}`}
                          onClick={() => handleStatusToggle(organization)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5540F5] focus:ring-offset-2 ${
                            organization.isActive
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              organization.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <StatusBadge active={organization.isActive} />
                      )}
                    </td>

                    {/* Row actions: view, edit, and delete. */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Both roles can view organizations. */}
                        <button
                          type="button"
                          onClick={() => openViewModal(organization)}
                          title="View organization"
                          aria-label="View organization"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Admin and Super Admin can edit. */}
                        {(isAdmin || isSuperAdmin) && (
                          <button
                            type="button"
                            onClick={() => openEditModal(organization)}
                            title="Edit organization"
                            aria-label="Edit organization"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-[#5540F5]"
                          >
                            <Pencil size={17} />
                          </button>
                        )}

                        {/* Only Super Admin can delete. */}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteOrganization(organization)
                            }
                            title="Delete organization"
                            aria-label="Delete organization"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create/Edit modal: the same form is reused for INSERT and UPDATE. */}
      {(modalType === "create" || modalType === "edit") && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#17233F]">
                  {modalType === "create"
                    ? "Add Organization"
                    : "Edit Organization"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalType === "create"
                    ? "Enter the new organization's details."
                    : "Update the organization's information."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                modalType === "create"
                  ? handleCreateOrganization
                  : handleUpdateOrganization
              }
            >
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Organization Name"
                    name="organizationName"
                    value={form.organizationName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. SkillMesh Technologies"
                  />

                  <FormField
                    label="Organization Code"
                    name="organizationCode"
                    value={form.organizationCode}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. SKM001"
                  />

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="organization@example.com"
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />

                  <FormField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />

                  <FormField
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />

                  <FormField
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                  />
                  <div className="sm:col-span-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Address
                      </span>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter complete address"
                        className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10"
                      />
                    </label>
                  </div>
                </div>

                {/* Checkbox controls the organization's IsActive value. */}
                {isSuperAdmin && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 accent-[#5540F5]"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-[#17233F]">
                        Active Organization
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Mark this organization as active on SkillMesh.
                      </span>
                    </span>
                  </label>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                {/* Submit performs INSERT or UPDATE depending on modalType. */}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5540F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4632DC] disabled:opacity-60"
                >
                  {saving && <RefreshCw size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : modalType === "create"
                      ? "Create Organization"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-only modal for viewing the selected organization. */}
      {modalType === "view" && selectedOrganization && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#17233F]">
                  Organization Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View the selected organization's information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close organization details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEECFF] text-[#5540F5]">
                  <Building2 size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-bold text-[#17233F]">
                    {selectedOrganization.organizationName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Code: {selectedOrganization.organizationCode || "—"}
                  </p>
                </div>
                <StatusBadge active={selectedOrganization.isActive} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Email", selectedOrganization.email],
                  ["Phone", selectedOrganization.phone],
                  ["Address", selectedOrganization.address],
                  ["City", selectedOrganization.city],
                  ["State", selectedOrganization.state],
                  ["Country", selectedOrganization.country],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-[#17233F]">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-[#5540F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4632DC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cancelDeleteOrganization();
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start gap-4 px-6 pt-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={23} />
              </div>

              <div className="flex-1">
                <h2
                  id="delete-modal-title"
                  className="text-lg font-bold text-[#17233F]"
                >
                  Delete Organization
                </h2>

                <p
                  id="delete-modal-description"
                  className="mt-2 text-sm leading-6 text-slate-500"
                >
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#17233F]">
                    "{deleteTarget.organizationName}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelDeleteOrganization}
                disabled={deleting}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDeleteOrganization}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteOrganization}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Organization
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
