import { useEffect, useMemo, useState } from "react";
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Power,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const API_ENDPOINT = `${API_BASE_URL}/api/SkillCategory`;

const emptyForm = {
  categoryName: "",
  description: "",
  isActive: true,
};

async function callCategoryApi(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();

  let data = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.Message ||
          data?.title ||
          `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

function normalizeCategory(item) {
  return {
    skillCategoryId: item.skillCategoryId ?? item.SkillCategoryId,
    categoryName: item.categoryName ?? item.CategoryName ?? "",
    description: item.description ?? item.Description ?? "",
    isActive: item.isActive ?? item.IsActive ?? true,
    createdAt: item.createdAt ?? item.CreatedAt ?? null,
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SkillCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalType, setModalType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentRole = (
    localStorage.getItem("skillmesh_role") ||
    localStorage.getItem("role") ||
    ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const isSuperAdmin = currentRole === "superadmin";

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const result = await callCategoryApi(API_ENDPOINT);

      const items = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.$values)
            ? result.$values
            : [];

      setCategories(items.map(normalizeCategory));
    } catch (err) {
      setError(err.message || "Unable to load skill categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        category.categoryName.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const activeCount = categories.filter((item) => item.isActive).length;
  const inactiveCount = categories.length - activeCount;

  function openCreateModal() {
    if (!isSuperAdmin) {
      setError("Only Super Admin can create skill categories.");
      return;
    }

    setForm({ ...emptyForm });
    setSelectedCategory(null);
    setFormError("");
    setModalType("create");
    setError("");
    setSuccess("");
  }

  function openEditModal(category) {
    if (!isSuperAdmin) {
      setError("Only Super Admin can edit skill categories.");
      return;
    }

    setSelectedCategory(category);
    setForm({
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive,
    });
    setFormError("");
    setModalType("edit");
    setError("");
    setSuccess("");
  }

  function openViewModal(category) {
    setSelectedCategory(category);
    setModalType("view");
    setError("");
  }

  function closeModal() {
    if (saving) return;

    setModalType("");
    setSelectedCategory(null);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isSuperAdmin) {
      setFormError("Only Super Admin can manage skill categories.");
      return;
    }

    const categoryName = form.categoryName.trim();
    const description = form.description.trim();

    if (!categoryName) {
      setFormError("Please enter a category name.");
      return;
    }

    if (categoryName.length > 100) {
      setFormError("Category name cannot exceed 100 characters.");
      return;
    }

    if (description.length > 250) {
      setFormError("Description cannot exceed 250 characters.");
      return;
    }

    const payload = {
      categoryName,
      description: description || null,
      isActive: form.isActive,
    };

    setSaving(true);
    setFormError("");
    setError("");
    setSuccess("");

    try {
      if (modalType === "create") {
        await callCategoryApi(API_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Skill category created successfully.");
      } else {
        if (!selectedCategory?.skillCategoryId) {
          throw new Error("Skill category ID is missing.");
        }

        await callCategoryApi(
          `${API_ENDPOINT}/${selectedCategory.skillCategoryId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );

        setSuccess("Skill category updated successfully.");
      }

      setModalType("");
      setSelectedCategory(null);
      setForm({ ...emptyForm });

      await loadCategories();
    } catch (err) {
      setFormError(err.message || "Unable to save skill category.");
    } finally {
      setSaving(false);
    }
  }

  function openDeleteConfirmation(category) {
    if (!isSuperAdmin) {
      setError("Only Super Admin can delete skill categories.");
      return;
    }

    setDeleteTarget(category);
    setError("");
    setSuccess("");
  }

  function cancelDelete() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!isSuperAdmin || !deleteTarget || deleting) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await callCategoryApi(`${API_ENDPOINT}/${deleteTarget.skillCategoryId}`, {
        method: "DELETE",
      });

      setDeleteTarget(null);
      setSuccess("Skill category deleted successfully.");

      await loadCategories();
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete this category. It may be linked to existing skills.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function toggleCategoryStatus(category) {
    if (!isSuperAdmin) {
      setError("Only Super Admin can change category status.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await callCategoryApi(`${API_ENDPOINT}/${category.skillCategoryId}`, {
        method: "PUT",
        body: JSON.stringify({
          categoryName: category.categoryName,
          description: category.description || null,
          isActive: !category.isActive,
        }),
      });

      setSuccess(
        `Skill category ${
          category.isActive ? "deactivated" : "activated"
        } successfully.`,
      );

      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to update category status.");
    }
  }

  return (
    <DashboardLayout role="Super Admin" title="Skill Categories">
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Layers size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#17233F]">
                  Skill Categories
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Organize skills into meaningful categories.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Add Category
              </button>
            )}
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
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
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Categories
              </p>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Layers size={20} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#17233F]">
              {categories.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">All skill categories</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Active Categories
              </p>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#17233F]">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Available for use</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Inactive Categories
              </p>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <XCircle size={20} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#17233F]">
              {inactiveCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Not currently available
            </p>
          </div>
        </div>

        {/* Categories table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#17233F]">
                Category Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Browse and manage the SkillMesh skill catalog.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Created At</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-14 text-center text-sm text-slate-500"
                    >
                      <RefreshCw
                        size={20}
                        className="mx-auto mb-3 animate-spin text-indigo-500"
                      />
                      Loading skill categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <Layers
                        size={30}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="font-semibold text-slate-700">
                        No categories found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or add a new category.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.skillCategoryId}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Layers size={19} />
                          </div>
                          <div>
                            <p className="font-semibold text-[#17233F]">
                              {category.categoryName}
                            </p>
                            {/* <p className="mt-1 text-xs text-slate-400">
                              ID: {category.skillCategoryId}
                            </p> */}
                          </div>
                        </div>
                      </td>

                      <td className="max-w-sm px-6 py-4 text-sm text-slate-600">
                        <p className="line-clamp-2">
                          {category.description || "No description"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {formatDate(category.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              category.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openViewModal(category)}
                            title="View category"
                            aria-label="View category"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Eye size={17} />
                          </button>

                          {isSuperAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(category)}
                                title="Edit category"
                                aria-label="Edit category"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleCategoryStatus(category)}
                                title={
                                  category.isActive
                                    ? "Deactivate category"
                                    : "Activate category"
                                }
                                aria-label={
                                  category.isActive
                                    ? "Deactivate category"
                                    : "Activate category"
                                }
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              >
                                <Power size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => openDeleteConfirmation(category)}
                                title="Delete category"
                                aria-label="Delete category"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredCategories.length} of {categories.length}{" "}
              categories
            </span>
            <span>SkillMesh · Skill Management</span>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modalType === "create" || modalType === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="my-6 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="category-form-title"
                  className="text-xl font-bold text-[#17233F]"
                >
                  {modalType === "create"
                    ? "Add Skill Category"
                    : "Edit Skill Category"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the category information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="categoryName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="categoryName"
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleFormChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Programming"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  maxLength={250}
                  rows={4}
                  placeholder="Describe the skills that belong in this category..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/250 characters
                </p>
              </div>

              {modalType === "edit" && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-700">
                      Active category
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Inactive categories should not be offered for new skill
                      assignments.
                    </span>
                  </span>
                </label>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {modalType === "create"
                        ? "Create Category"
                        : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalType === "view" && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-view-title"
            className="my-6 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Layers size={22} />
                </div>
                <div>
                  <h2
                    id="category-view-title"
                    className="text-xl font-bold text-[#17233F]"
                  >
                    Category Details
                  </h2>
                  {/* <p className="mt-1 text-sm text-slate-500">
                    ID: {selectedCategory.skillCategoryId}
                  </p> */}
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category Name
                </p>
                <p className="mt-2 text-base font-bold text-[#17233F]">
                  {selectedCategory.categoryName}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedCategory.description || "No description provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedCategory.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedCategory.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Created At
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDate(selectedCategory.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
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
              cancelDelete();
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            <div className="flex items-start gap-4 px-6 pt-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={23} />
              </div>

              <div className="flex-1">
                <h2
                  id="delete-category-title"
                  className="text-lg font-bold text-[#17233F]"
                >
                  Delete Skill Category
                </h2>

                <p
                  id="delete-category-description"
                  className="mt-2 text-sm leading-6 text-slate-500"
                >
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#17233F]">
                    "{deleteTarget.categoryName}"
                  </span>
                  ? Categories linked to existing skills may not be deletable.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
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
                    Delete Category
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
