import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layers,
  Power,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const SKILL_API = `${API_BASE_URL}/api/Skill`;
const CATEGORY_API = `${API_BASE_URL}/api/SkillCategory`;

const emptyForm = {
  skillCategoryId: "",
  skillName: "",
  description: "",
  isActive: true,
};

// Read API properties regardless of PascalCase or camelCase.
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

// Handle APIs returning an array or an object containing an array.
function getArray(response, ...keys) {
  if (Array.isArray(response)) return response;

  for (const key of ["data", "items", ...keys]) {
    const value = getValue(response, key);

    if (Array.isArray(value)) return value;
  }

  return [];
}

function toBoolean(value) {
  return (
    value === true || value === 1 || String(value).toLowerCase() === "true"
  );
}

// Normalize category records.
function normalizeCategory(item) {
  return {
    skillCategoryId: getValue(item, "skillCategoryId", "categoryId", "id"),
    categoryName: getValue(item, "categoryName", "skillCategoryName", "name"),
    isActive: toBoolean(getValue(item, "isActive")),
  };
}

// Normalize skill records.
function normalizeSkill(item, categories = []) {
  const categoryId = getValue(item, "skillCategoryId", "categoryId");

  const category = categories.find(
    (item) => String(item.skillCategoryId) === String(categoryId),
  );

  return {
    skillId: getValue(item, "skillId", "id"),
    skillCategoryId: categoryId,
    skillName: getValue(item, "skillName", "name"),
    description: getValue(item, "description"),
    categoryName:
      getValue(item, "categoryName", "skillCategoryName") ||
      category?.categoryName ||
      "Uncategorized",
    isActive: toBoolean(getValue(item, "isActive")),
    createdAt: getValue(item, "createdAt"),
  };
}

// Common API helper with the logged-in user's token.
async function callSkillApi(url, options = {}) {
  const token = localStorage.getItem("skillmesh_token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

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

// Reusable status badge.
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

// Reusable form input.
function FormField({
  label,
  name,
  value,
  onChange,
  required = false,
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
        type="text"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#17233F] outline-none transition placeholder:text-slate-400 focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10"
      />
    </label>
  );
}

export default function Skill({ role }) {
  // Match the role-handling pattern used by Organization.jsx.
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

  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalType, setModalType] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // GET: Load skill categories first, then normalize the skills.
  async function loadSkills() {
    setLoading(true);
    setError("");

    try {
      const [categoryResponse, skillResponse] = await Promise.all([
        callSkillApi(CATEGORY_API),
        callSkillApi(SKILL_API),
      ]);

      const categoryRecords = getArray(
        categoryResponse,
        "categories",
        "skillCategories",
      ).map(normalizeCategory);

      setCategories(categoryRecords);

      const skillRecords = getArray(skillResponse, "skills").map((item) =>
        normalizeSkill(item, categoryRecords),
      );

      setSkills(skillRecords);
    } catch (err) {
      setError(err.message || "Unable to load skills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  // Summary statistics.
  const totalSkills = skills.length;

  const activeSkills = skills.filter((skill) => skill.isActive).length;

  const inactiveSkills = totalSkills - activeSkills;

  const totalCategories = new Set(
    skills.map((skill) => String(skill.skillCategoryId)),
  ).size;

  // Search and filter skills locally.
  const filteredSkills = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesSearch = [
        skill.skillName,
        skill.categoryName,
        skill.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search),
      );

      const matchesCategory =
        categoryFilter === "All" ||
        String(skill.skillCategoryId) === String(categoryFilter);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && skill.isActive) ||
        (statusFilter === "Inactive" && !skill.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [skills, searchText, categoryFilter, statusFilter]);

  // Open the Add Skill form. Super Admin only.
  function openCreateModal() {
    if (!isSuperAdmin) return;

    setForm({
      ...emptyForm,
      skillCategoryId: categories[0]?.skillCategoryId || "",
    });

    setSelectedSkill(null);
    setFormError("");
    setError("");
    setSuccess("");
    setModalType("create");
  }

  // Open the Edit Skill form. Super Admin only.
  function openEditModal(skill) {
    if (!isSuperAdmin) return;

    setForm({
      skillCategoryId: skill.skillCategoryId || "",
      skillName: skill.skillName || "",
      description: skill.description || "",
      isActive: skill.isActive,
    });

    setSelectedSkill(skill);
    setFormError("");
    setError("");
    setSuccess("");
    setModalType("edit");
  }

  // Open the read-only Skill Details modal.
  function openViewModal(skill) {
    setSelectedSkill(skill);
    setModalType("view");
  }

  function closeModal() {
    if (saving) return;

    setModalType("");
    setSelectedSkill(null);
    setFormError("");
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validateForm() {
    if (!String(form.skillCategoryId).trim()) {
      return "Please select a skill category.";
    }

    if (!form.skillName.trim()) {
      return "Skill name is required.";
    }

    if (form.skillName.trim().length > 100) {
      return "Skill name cannot exceed 100 characters.";
    }

    return "";
  }

  // POST: Create a skill. Super Admin only.
  async function handleCreateSkill(event) {
    event.preventDefault();

    if (!isSuperAdmin) {
      setFormError("Only Super Admin can create skills.");
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
    setSuccess("");

    try {
      const payload = {
        skillCategoryId: Number(form.skillCategoryId),
        skillName: form.skillName.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      };

      await callSkillApi(SKILL_API, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setModalType("");
      setSelectedSkill(null);
      setSuccess("Skill created successfully.");

      await loadSkills();
    } catch (err) {
      setFormError(err.message || "Unable to create skill.");
    } finally {
      setSaving(false);
    }
  }

  // PUT: Update an existing skill. Super Admin only.
  async function handleUpdateSkill(event) {
    event.preventDefault();

    if (!isSuperAdmin) {
      setFormError("Only Super Admin can edit skills.");
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const skillId = selectedSkill?.skillId;

    if (!skillId) {
      setFormError("Skill ID is missing. Cannot update this skill.");
      return;
    }

    setSaving(true);
    setFormError("");
    setError("");
    setSuccess("");

    try {
      const payload = {
        skillCategoryId: Number(form.skillCategoryId),
        skillName: form.skillName.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      };

      await callSkillApi(`${SKILL_API}/${skillId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setModalType("");
      setSelectedSkill(null);
      setSuccess("Skill updated successfully.");

      await loadSkills();
    } catch (err) {
      setFormError(err.message || "Unable to update skill.");
    } finally {
      setSaving(false);
    }
  }

  // PUT: Toggle status. Super Admin only.
  async function handleStatusToggle(skill) {
    if (!isSuperAdmin) return;

    const skillId = skill.skillId;

    if (!skillId) {
      setError("Skill ID is missing. Cannot update status.");
      return;
    }

    const newStatus = !skill.isActive;

    setError("");
    setSuccess("");

    // Optimistically update the table.
    setSkills((previousSkills) =>
      previousSkills.map((item) =>
        String(item.skillId) === String(skillId)
          ? { ...item, isActive: newStatus }
          : item,
      ),
    );

    try {
      await callSkillApi(`${SKILL_API}/${skillId}`, {
        method: "PUT",
        body: JSON.stringify({
          skillCategoryId: Number(skill.skillCategoryId),
          skillName: skill.skillName,
          description: skill.description,
          isActive: newStatus,
        }),
      });

      setSuccess(
        `${skill.skillName} is now ${newStatus ? "Active" : "Inactive"}.`,
      );
    } catch (err) {
      // Restore the previous status if the API fails.
      setSkills((previousSkills) =>
        previousSkills.map((item) =>
          String(item.skillId) === String(skillId)
            ? { ...item, isActive: !newStatus }
            : item,
        ),
      );

      setError(err.message || "Unable to update skill status.");
    }
  }

  // DELETE: Open confirmation modal. Super Admin only.
  function handleDeleteSkill(skill) {
    if (!isSuperAdmin) return;

    setDeleteTarget(skill);
    setError("");
    setSuccess("");
  }

  async function confirmDeleteSkill() {
    if (!isSuperAdmin || !deleteTarget || deleting) return;

    const skill = deleteTarget;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await callSkillApi(`${SKILL_API}/${skill.skillId}`, {
        method: "DELETE",
      });

      setDeleteTarget(null);
      setSuccess("Skill deleted successfully.");

      await loadSkills();
    } catch (err) {
      setError(err.message || "Unable to delete skill.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function cancelDeleteSkill() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  return (
    <DashboardLayout
      role={isSuperAdmin ? "Super Admin" : "Admin"}
      title="Skill Management"
    >
      {/* Page heading and actions */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Brain size={16} />
            <span>Administration</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
            Skill Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            {isSuperAdmin
              ? "Create, view, and manage the SkillMesh skill catalog."
              : "View the available skills and their categories."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSkills}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5540F5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4632DC]"
            >
              <Plus size={17} />
              Add Skill
            </button>
          )}
        </div>
      </div>

      {/* API error */}
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

      {/* Success message */}
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

      {/* Summary cards */}
      <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Skills</p>
            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Brain size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : totalSkills}
          </p>
          <p className="mt-1 text-xs text-slate-500">Skills in the catalog</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Skills</p>
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : activeSkills}
          </p>
          <p className="mt-1 text-xs text-slate-500">Available for use</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Inactive Skills
            </p>
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <XCircle size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : inactiveSkills}
          </p>
          <p className="mt-1 text-xs text-slate-500">Currently unavailable</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Categories Used
            </p>
            <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <Layers size={21} />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#17233F]">
            {loading ? "—" : totalCategories}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Categories represented by skills
          </p>
        </div>
      </section>

      {/* Skills table */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#17233F]">Skills</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading skills..."
                : `${filteredSkills.length} skill${
                    filteredSkills.length === 1 ? "" : "s"
                  } found`}
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
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search skills..."
                aria-label="Search skills"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10 sm:w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#5540F5]"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option
                  key={category.skillCategoryId}
                  value={category.skillCategoryId}
                >
                  {category.categoryName}
                </option>
              ))}
            </select>

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw size={25} className="mb-3 animate-spin text-[#5540F5]" />
            <p className="text-sm">Loading skills...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
              <Brain size={30} />
            </div>
            <h3 className="font-semibold text-[#17233F]">No skills found</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {searchText || categoryFilter !== "All" || statusFilter !== "All"
                ? "Try changing your search text or filters."
                : "There are no skills in the catalog yet."}
            </p>

            {isSuperAdmin &&
              !searchText &&
              categoryFilter === "All" &&
              statusFilter === "All" && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5540F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4632DC]"
                >
                  <Plus size={16} />
                  Add Skill
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Skill</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSkills.map((skill, index) => (
                  <tr
                    key={skill.skillId || index}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEECFF] text-[#5540F5]">
                          <Brain size={21} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#17233F]">
                            {skill.skillName || "Unnamed skill"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                        {skill.categoryName}
                      </span>
                    </td>

                    <td className="max-w-xs px-6 py-4 text-slate-600">
                      <p className="line-clamp-2">
                        {skill.description || "No description"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={skill.isActive}
                          aria-label={`Change status for ${skill.skillName}`}
                          onClick={() => handleStatusToggle(skill)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5540F5] focus:ring-offset-2 ${
                            skill.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              skill.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <StatusBadge active={skill.isActive} />
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openViewModal(skill)}
                          title="View skill"
                          aria-label="View skill"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Eye size={17} />
                        </button>

                        {isSuperAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(skill)}
                              title="Edit skill"
                              aria-label="Edit skill"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-[#5540F5]"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(skill)}
                              title="Delete skill"
                              aria-label="Delete skill"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </>
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

      {/* Create/Edit modal */}
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
                  {modalType === "create" ? "Add Skill" : "Edit Skill"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalType === "create"
                    ? "Enter the new skill details."
                    : "Update the skill information."}
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
                modalType === "create" ? handleCreateSkill : handleUpdateSkill
              }
            >
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    {formError}
                  </div>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Skill Category
                    <span className="ml-1 text-red-500">*</span>
                  </span>

                  <select
                    name="skillCategoryId"
                    value={form.skillCategoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#17233F] outline-none focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10"
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((category) => {
                        // Keep the current category available while editing.
                        return (
                          category.isActive ||
                          String(category.skillCategoryId) ===
                            String(form.skillCategoryId)
                        );
                      })
                      .map((category) => (
                        <option
                          key={category.skillCategoryId}
                          value={category.skillCategoryId}
                        >
                          {category.categoryName}
                        </option>
                      ))}
                  </select>
                </label>

                <FormField
                  label="Skill Name"
                  name="skillName"
                  value={form.skillName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. ASP.NET Core"
                />

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter a short description of this skill"
                    className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5540F5] focus:ring-2 focus:ring-[#5540F5]/10"
                  />
                </label>

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
                        Active Skill
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Make this skill available in SkillMesh.
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

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5540F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4632DC] disabled:opacity-60"
                >
                  {saving && <RefreshCw size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : modalType === "create"
                      ? "Create Skill"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-only Skill Details modal */}
      {modalType === "view" && selectedSkill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#17233F]">
                  Skill Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View the selected skill information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close skill details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEECFF] text-[#5540F5]">
                  <Brain size={28} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-bold text-[#17233F]">
                    {selectedSkill.skillName}
                  </h3>
                </div>

                <StatusBadge active={selectedSkill.isActive} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Category", selectedSkill.categoryName],
                  ["Description", selectedSkill.description],
                  ["Created At", selectedSkill.createdAt],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-[#17233F]">
                      {label === "Created At" && value
                        ? new Date(value).toLocaleDateString()
                        : value || "—"}
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cancelDeleteSkill();
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-skill-title"
            aria-describedby="delete-skill-description"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            <div className="flex items-start gap-4 px-6 pt-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={23} />
              </div>

              <div className="flex-1">
                <h2
                  id="delete-skill-title"
                  className="text-lg font-bold text-[#17233F]"
                >
                  Delete Skill
                </h2>

                <p
                  id="delete-skill-description"
                  className="mt-2 text-sm leading-6 text-slate-500"
                >
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#17233F]">
                    "{deleteTarget.skillName}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelDeleteSkill}
                disabled={deleting}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDeleteSkill}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteSkill}
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
                    Delete Skill
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
