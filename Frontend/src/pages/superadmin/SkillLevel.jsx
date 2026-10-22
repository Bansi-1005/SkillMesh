import { useEffect, useMemo, useState } from "react";
import {
  Award,
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
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const EMPTY_FORM = {
  levelNumber: "",
  levelName: "",
  description: "",
};

async function callSkillLevelApi(endpoint, options = {}) {
  const token = localStorage.getItem("skillmesh_token");

  const response = await fetch(`${API_BASE_URL}/api/SkillLevel${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.Message || data?.title;

    throw new Error(
      message || `Skill Level API failed with status ${response.status}`,
    );
  }

  return data;
}

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

function getArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.skillLevels)) return response.skillLevels;
  if (Array.isArray(response?.SkillLevels)) return response.SkillLevels;

  return [];
}

function toBoolean(value) {
  return value === true || value === 1 || value === "true";
}

function normalizeSkillLevel(item) {
  const activeValue = getValue(item, "isActive", "active");

  return {
    skillLevelId: getValue(item, "skillLevelId", "SkillLevelId", "id"),
    levelNumber: getValue(item, "levelNumber", "LevelNumber"),
    levelName: getValue(item, "levelName", "LevelName", "name"),
    description: getValue(item, "description", "Description"),
    isActive: activeValue === "" ? true : toBoolean(activeValue),
  };
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function SkillLevel({ role = "Super Admin" }) {
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
  const canManage = isSuperAdmin;

  const [skillLevels, setSkillLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadSkillLevels() {
    setLoading(true);
    setError("");

    try {
      const response = await callSkillLevelApi("");

      setSkillLevels(getArray(response).map(normalizeSkillLevel));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkillLevels();
  }, []);

  const filteredLevels = useMemo(() => {
    return skillLevels.filter((level) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        level.levelNumber,
        level.levelName,
        level.description,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchText),
      );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && level.isActive) ||
        (statusFilter === "inactive" && !level.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [skillLevels, search, statusFilter]);

  const activeCount = skillLevels.filter((level) => level.isActive).length;
  const inactiveCount = skillLevels.length - activeCount;

  function openCreateModal() {
    if (!canManage) return;

    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(level) {
    if (!canManage) return;

    setEditingId(level.skillLevelId);
    setForm({
      levelNumber: String(level.levelNumber ?? ""),
      levelName: String(level.levelName ?? ""),
      description: String(level.description ?? ""),
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canManage) {
      setError("You do not have permission to manage skill levels.");
      return;
    }

    const levelNumber = Number(form.levelNumber);
    const levelName = form.levelName.trim();

    if (
      form.levelNumber === "" ||
      !Number.isInteger(levelNumber) ||
      levelNumber < 0 ||
      levelNumber > 5
    ) {
      setError("Level number must be a whole number between 0 and 5.");
      return;
    }

    if (!levelName) {
      setError("Please enter a level name.");
      return;
    }

    const duplicate = skillLevels.some(
      (level) =>
        String(level.skillLevelId) !== String(editingId) &&
        (Number(level.levelNumber) === levelNumber ||
          String(level.levelName).trim().toLowerCase() ===
            levelName.toLowerCase()),
    );

    if (duplicate) {
      setError("A skill level with this number or name already exists.");
      return;
    }

    const payload = {
      levelNumber,
      levelName,
      description: form.description.trim(),
    };

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId != null && editingId !== "") {
        await callSkillLevelApi(`/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setSuccess("Skill level updated successfully.");
      } else {
        await callSkillLevelApi("", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Skill level created successfully.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadSkillLevels();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(level) {
    if (!canManage) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${level.levelName}"? This action may fail if other records reference this level.`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await callSkillLevelApi(`/${level.skillLevelId}`, {
        method: "DELETE",
      });

      setSuccess("Skill level deleted successfully.");
      await loadSkillLevels();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function openViewModal(level) {
    setSelectedLevel(level);
    setViewModalOpen(true);
  }

  const statCards = [
    {
      label: "Total Skill Levels",
      value: skillLevels.length,
      icon: Layers,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active Levels",
      value: activeCount,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Inactive Levels",
      value: inactiveCount,
      icon: XCircle,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <DashboardLayout
      role={isSuperAdmin ? "Super Admin" : "Admin"}
      title="Skill Level Management"
    >
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17233F] sm:text-3xl">
              Skill Level Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage skill proficiency levels across the SkillMesh platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadSkillLevels}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#17233F] shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {canManage && (
              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Plus size={17} />
                Add Skill Level
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && !modalOpen && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
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
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} />
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
              aria-label="Dismiss success"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
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

        {/* Skill level table */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#17233F]">
                Skill Proficiency Levels
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage the proficiency levels used throughout
                SkillMesh.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search skill levels..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading skill levels...
            </div>
          ) : skillLevels.length === 0 && !error ? (
            <div className="py-16 text-center">
              <Award size={36} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-[#17233F]">
                No skill levels found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {canManage
                  ? "Add your first skill proficiency level."
                  : "Skill proficiency levels have not been added yet."}
              </p>
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No skill levels match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Level No.</th>
                    <th className="px-6 py-4 font-semibold">Level Name</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLevels.map((level, index) => (
                    <tr
                      key={level.skillLevelId || index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-700">
                          {level.levelNumber}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-[#17233F]">
                        {level.levelName || "—"}
                      </td>

                      <td className="max-w-xs px-6 py-4 text-slate-500">
                        <p className="line-clamp-2">
                          {level.description || "No description provided"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                            level.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {level.isActive ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          {level.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(level)}
                            title="View skill level"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Eye size={16} />
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(level)}
                                title="Edit skill level"
                                className="rounded-lg border border-indigo-100 p-2 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(level)}
                                title="Delete skill level"
                                className="rounded-lg border border-rose-100 p-2 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 size={16} />
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

          <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
            Showing {filteredLevels.length} of {skillLevels.length} skill levels
          </div>
        </section>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#17233F]">
                  {editingId != null ? "Edit Skill Level" : "Add Skill Level"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the proficiency level details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="levelNumber"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Level Number *
                  </label>

                  <input
                    id="levelNumber"
                    type="number"
                    min="0"
                    max="5"
                    step="1"
                    required
                    value={form.levelNumber}
                    onChange={(event) =>
                      setForm({ ...form, levelNumber: event.target.value })
                    }
                    placeholder="Enter a number from 0 to 5"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Use a whole number between 0 and 5.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="levelName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Level Name *
                  </label>

                  <input
                    id="levelName"
                    type="text"
                    required
                    maxLength={100}
                    value={form.levelName}
                    onChange={(event) =>
                      setForm({ ...form, levelName: event.target.value })
                    }
                    placeholder="e.g. Beginner"
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
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Describe the expected proficiency..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId != null
                      ? "Save Changes"
                      : "Create Skill Level"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewModalOpen && selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-[#17233F]">
                Skill Level Details
              </h2>

              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Award size={28} />
                </div>

                <div>
                  <p className="text-xl font-bold text-[#17233F]">
                    {selectedLevel.levelName || "Unnamed Level"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Proficiency Level {selectedLevel.levelNumber}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {selectedLevel.description || "No description provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                    selectedLevel.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {selectedLevel.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
