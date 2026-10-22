import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Network,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ArrowRight,
  ArrowRightLeft,
  GitBranch,
  Link2,
  AlertCircle,
  CheckCircle2,
  Layers,
  BookOpen,
  LockKeyhole,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const emptyForm = {
  skillId: "",
  relatedSkillId: "",
  relationshipType: "Prerequisite",
};

function getValue(obj, ...keys) {
  if (!obj) return undefined;

  for (const key of keys) {
    const foundKey = Object.keys(obj).find(
      (item) => item.toLowerCase() === key.toLowerCase(),
    );

    if (foundKey && obj[foundKey] !== undefined) {
      return obj[foundKey];
    }
  }

  return undefined;
}

function getArray(response, ...keys) {
  if (Array.isArray(response)) return response;

  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }

  for (const key of keys) {
    const value = getValue(response, key);
    if (Array.isArray(value)) return value;
  }

  return [];
}

function normalizeSkill(item) {
  return {
    id: Number(getValue(item, "skillId", "SkillId", "id")),
    name: getValue(item, "skillName", "SkillName", "name") || "Unnamed skill",
    category:
      getValue(item, "categoryName", "CategoryName", "skillCategoryName") ||
      "Skill",
  };
}

function normalizeRelationship(item) {
  return {
    id: Number(
      getValue(item, "skillRelationshipId", "SkillRelationshipId", "id"),
    ),
    skillId: Number(getValue(item, "skillId", "SkillId")),
    relatedSkillId: Number(getValue(item, "relatedSkillId", "RelatedSkillId")),
    skillName: getValue(item, "skillName", "SkillName") || "",
    relatedSkillName:
      getValue(item, "relatedSkillName", "RelatedSkillName") || "",
    relationshipType:
      getValue(item, "relationshipType", "RelationshipType") || "Related",
    createdAt: getValue(item, "createdAt", "CreatedAt"),
  };
}

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("skillmesh_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let result = text;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    // The API may return plain text instead of JSON.
  }

  if (!response.ok) {
    const message =
      typeof result === "string"
        ? result
        : result?.message ||
          result?.title ||
          `Request failed (${response.status})`;

    throw new Error(message);
  }

  return result;
}

export default function SkillRelationship({ role = "Super Admin" }) {
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
  const canManage = isSuperAdmin;

  const displayRole = isSuperAdmin ? "Super Admin" : "Admin";

  const [skills, setSkills] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [skillResponse, relationshipResponse] = await Promise.all([
        apiRequest("/api/Skill"),
        apiRequest("/api/SkillRelationship"),
      ]);

      const normalizedSkills = getArray(skillResponse, "skills", "items").map(
        normalizeSkill,
      );

      const normalizedRelationships = getArray(
        relationshipResponse,
        "skillRelationships",
        "relationships",
        "items",
      ).map(normalizeRelationship);

      setSkills(normalizedSkills);
      setRelationships(
        normalizedRelationships.map((relationship) => {
          const mainSkill = normalizedSkills.find(
            (skill) => skill.id === relationship.skillId,
          );

          const relatedSkill = normalizedSkills.find(
            (skill) => skill.id === relationship.relatedSkillId,
          );

          return {
            ...relationship,
            skillName:
              relationship.skillName || mainSkill?.name || "Unknown skill",
            relatedSkillName:
              relationship.relatedSkillName ||
              relatedSkill?.name ||
              "Unknown skill",
          };
        }),
      );
    } catch (err) {
      setError(err.message || "Unable to load skill relationships.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRelationships = useMemo(() => {
    const query = search.trim().toLowerCase();

    return relationships.filter((item) => {
      const matchesSearch =
        !query ||
        item.skillName.toLowerCase().includes(query) ||
        item.relatedSkillName.toLowerCase().includes(query) ||
        item.relationshipType.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All" ||
        item.relationshipType.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [relationships, search, typeFilter]);

  const prerequisiteCount = relationships.filter(
    (item) => item.relationshipType.toLowerCase() === "prerequisite",
  ).length;

  const relatedCount = relationships.filter(
    (item) => item.relationshipType.toLowerCase() === "related",
  ).length;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      skillId: String(item.skillId),
      relatedSkillId: String(item.relatedSkillId),
      relationshipType: item.relationshipType,
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const skillId = Number(form.skillId);
    const relatedSkillId = Number(form.relatedSkillId);

    if (!skillId || !relatedSkillId) {
      setError("Please select both skills.");
      return;
    }

    if (skillId === relatedSkillId) {
      setError("A skill cannot be related to itself.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        skillId,
        relatedSkillId,
        relationshipType: form.relationshipType,
      };

      if (editingId !== null) {
        await apiRequest(`/api/SkillRelationship/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/api/SkillRelationship", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      setSuccess(
        editingId !== null
          ? "Relationship updated successfully."
          : "Relationship created successfully.",
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save relationship.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setError("");
    setSuccess("");

    try {
      await apiRequest(`/api/SkillRelationship/${deleteTarget.id}`, {
        method: "DELETE",
      });

      setDeleteTarget(null);
      setSuccess("Relationship deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete relationship.");
      setDeleteTarget(null);
    }
  }

  return (
    <DashboardLayout role={displayRole}>
      <div className="min-h-full space-y-5 pb-5">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Network size={17} />
              Skill Intelligence
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Skill Relationship Explorer
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Explore prerequisites and connections between skills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200
                bg-white px-4 py-2.5 text-sm font-semibold text-slate-700
                transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {canManage && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600
                  px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                  transition hover:bg-indigo-700"
              >
                <Plus size={17} />
                Add Relationship
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && !modalOpen && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="ml-auto"
              aria-label="Dismiss success message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Network}
            label="Total Connections"
            value={relationships.length}
            note="All skill relationships"
            color="indigo"
          />
          <SummaryCard
            icon={GitBranch}
            label="Prerequisites"
            value={prerequisiteCount}
            note="Skills to learn first"
            color="violet"
          />
          <SummaryCard
            icon={Link2}
            label="Related Skills"
            value={relatedCount}
            note="Connected skill concepts"
            color="emerald"
          />
        </div>

        {/* Explorer banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-5 text-white sm:p-6">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Network size={14} />
              SKILL GRAPH
            </span>

            <h2 className="mt-3 text-xl font-bold sm:text-2xl">
              Every skill connects to a bigger picture.
            </h2>

            <p className="mt-2 text-sm leading-6 text-indigo-100">
              Understand which skills provide a foundation for others and which
              skills share related concepts. These relationships can support
              SkillMesh learning paths and skill-gap analysis.
            </p>
          </div>

          <Network
            size={145}
            strokeWidth={0.8}
            className="absolute -right-5 -bottom-8 rotate-12 text-white/15"
          />
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search skills or relationship type..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value="All">All relationships</option>
            <option value="Prerequisite">Prerequisite</option>
            <option value="Related">Related</option>
          </select>

          <span className="text-sm text-slate-500">
            {filteredRelationships.length} connection
            {filteredRelationships.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Relationship cards */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Connection Map
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Each card represents one relationship between two skills.
              </p>
            </div>
            <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
              Visual explorer
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : filteredRelationships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <Network size={38} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-700">
                No relationships found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or create a new skill connection.
              </p>

              {canManage && (
                <button
                  onClick={openCreate}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Create Relationship
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredRelationships.map((item) => {
                const isPrerequisite =
                  item.relationshipType.toLowerCase() === "prerequisite";

                return (
                  <article
                    key={item.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            isPrerequisite
                              ? "bg-violet-100 text-violet-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isPrerequisite ? (
                            <GitBranch size={20} />
                          ) : (
                            <Link2 size={20} />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            Relationship #{item.id}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isPrerequisite
                                ? "bg-violet-50 text-violet-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {item.relationshipType}
                          </span>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex gap-1 opacity-100 sm:opacity-70 sm:group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit relationship"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            title="Delete relationship"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] items-center gap-2">
                      <SkillNode
                        name={item.skillName}
                        caption="Main skill"
                        variant="indigo"
                      />

                      <div className="flex flex-col items-center gap-1 text-indigo-500">
                        {isPrerequisite ? (
                          <ArrowRight size={24} />
                        ) : (
                          <ArrowRightLeft size={24} />
                        )}
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                          {isPrerequisite ? "Leads to" : "Related"}
                        </span>
                      </div>

                      <SkillNode
                        name={item.relatedSkillName}
                        caption="Connected skill"
                        variant={isPrerequisite ? "violet" : "emerald"}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-400">
                        {isPrerequisite
                          ? "Foundation → Next skill"
                          : "Connected concepts"}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <CheckCircle2 size={13} />
                        Connected
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {!canManage && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <LockKeyhole size={17} />
            You have view-only access to skill relationships.
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId !== null
                    ? "Edit Relationship"
                    : "Create Relationship"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Connect two skills in your skill graph.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-indigo-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
                  <Network size={17} />
                  Build a skill connection
                </div>
                <p className="mt-1 text-xs leading-5 text-indigo-700">
                  Select the starting skill and the skill connected to it. The
                  order matters for prerequisites.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Main Skill
                </label>
                <select
                  required
                  value={form.skillId}
                  onChange={(event) =>
                    setForm({ ...form, skillId: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select main skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Relationship Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Prerequisite", "Related"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, relationshipType: type })
                      }
                      className={`rounded-xl border p-3 text-left transition ${
                        form.relationshipType === type
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {type === "Prerequisite" ? (
                          <GitBranch size={17} className="text-violet-600" />
                        ) : (
                          <Link2 size={17} className="text-emerald-600" />
                        )}
                        <span className="text-sm font-semibold text-slate-800">
                          {type}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {type === "Prerequisite"
                          ? "Learn the main skill first."
                          : "Connect related concepts."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Connected Skill
                </label>
                <select
                  required
                  value={form.relatedSkillId}
                  onChange={(event) =>
                    setForm({ ...form, relatedSkillId: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select connected skill</option>
                  {skills
                    .filter((skill) => String(skill.id) !== form.skillId)
                    .map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || skills.length < 2}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create Connection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-slate-800">
              Delete relationship?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              This will remove the connection between{" "}
              <strong>{deleteTarget.skillName}</strong> and{" "}
              <strong>{deleteTarget.relatedSkillName}</strong>.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, note, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{note}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SkillNode({ name, caption, variant }) {
  const styles = {
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-800",
    violet: "border-violet-100 bg-violet-50 text-violet-800",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
  };

  return (
    <div
      className={`min-w-0 rounded-xl border p-3 text-center ${styles[variant]}`}
    >
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80">
        <BookOpen size={17} />
      </div>

      <p className="break-words text-sm font-bold">{name}</p>
      <p className="mt-1 text-[10px] font-medium opacity-70">{caption}</p>
    </div>
  );
}
