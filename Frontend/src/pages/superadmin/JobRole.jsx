import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Cloud,
  Code2,
  Database,
  Edit3,
  Eye,
  FileText,
  Filter,
  Layers3,
  LoaderCircle,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5182"
).replace(/\/+$/, "");

const API = {
  jobRoles: `${API_BASE_URL}/api/JobRole`,
  categories: `${API_BASE_URL}/api/SkillCategory`,
  skills: `${API_BASE_URL}/api/Skill`,
  skillLevels: `${API_BASE_URL}/api/SkillLevel`,
  jobRoleSkills: `${API_BASE_URL}/api/JobRoleSkill`,
};

const EMPTY_ROLE = {
  jobRoleName: "",
  description: "",
  isActive: true,
};

const EMPTY_SKILL = {
  skillCategoryId: "",
  skillId: "",
  requiredLevel: "",
  isMandatory: true,
};

function readValue(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      return object[key];
    }
  }
  return undefined;
}

function getItems(response) {
  if (Array.isArray(response)) return response;

  return (
    response?.data ??
    response?.items ??
    response?.jobRoles ??
    response?.JobRoles ??
    response?.skills ??
    response?.Skills ??
    response?.skillCategories ??
    response?.SkillCategories ??
    response?.skillLevels ??
    response?.SkillLevels ??
    response?.jobRoleSkills ??
    response?.JobRoleSkills ??
    []
  );
}

function normalizeRole(item) {
  return {
    ...item,
    jobRoleId: readValue(item, "jobRoleId", "JobRoleId", "id", "Id"),
    jobRoleName:
      readValue(
        item,
        "jobRoleName",
        "JobRoleName",
        "roleName",
        "RoleName",
        "name",
        "Name",
      ) || "",
    description: readValue(item, "description", "Description") || "",
    isActive: readValue(item, "isActive", "IsActive") ?? true,
    createdAt: readValue(item, "createdAt", "CreatedAt"),
  };
}

function normalizeCategory(item) {
  return {
    ...item,
    skillCategoryId: readValue(
      item,
      "skillCategoryId",
      "SkillCategoryId",
      "id",
      "Id",
    ),
    skillCategoryName:
      readValue(
        item,
        "skillCategoryName",
        "SkillCategoryName",
        "categoryName",
        "CategoryName",
        "name",
        "Name",
      ) || "",
  };
}

function normalizeSkill(item) {
  return {
    ...item,
    skillId: readValue(item, "skillId", "SkillId", "id", "Id"),
    skillName: readValue(item, "skillName", "SkillName", "name", "Name") || "",
    skillCategoryId: readValue(item, "skillCategoryId", "SkillCategoryId"),
    categoryName:
      readValue(
        item,
        "skillCategoryName",
        "SkillCategoryName",
        "categoryName",
        "CategoryName",
      ) || "",
  };
}

function normalizeLevel(item) {
  return {
    ...item,
    skillLevelId: readValue(
      item,
      "skillLevelId",
      "SkillLevelId",
      "requiredSkillLevelId",
      "RequiredSkillLevelId",
      "id",
      "Id",
    ),
    levelName: readValue(item, "levelName", "LevelName", "name", "Name") || "",
    levelNumber: readValue(item, "levelNumber", "LevelNumber"),
  };
}

function normalizeRequiredSkill(item) {
  return {
    ...item,
    jobRoleId: readValue(item, "jobRoleId", "JobRoleId"),
    jobRoleSkillId: readValue(
      item,
      "jobRoleSkillId",
      "JobRoleSkillId",
      "id",
      "Id",
    ),
    skillId: readValue(item, "skillId", "SkillId"),
    skillName: readValue(item, "skillName", "SkillName") || "Skill",
    skillCategoryId: readValue(item, "skillCategoryId", "SkillCategoryId"),
    categoryName:
      readValue(
        item,
        "skillCategoryName",
        "SkillCategoryName",
        "categoryName",
        "CategoryName",
      ) || "",
    requiredLevel: readValue(
      item,
      "requiredSkillLevelId",
      "RequiredSkillLevelId",
      "requiredLevel",
      "RequiredLevel",
      "skillLevelId",
      "SkillLevelId",
    ),
    levelName: readValue(item, "levelName", "LevelName") || "",
    isMandatory: readValue(item, "isMandatory", "IsMandatory") ?? true,
  };
}

async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("skillmesh_token");

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();

  let result = null;

  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result || `Request failed (${response.status})`
        : result?.message ||
            result?.Message ||
            result?.title ||
            `Request failed (${response.status})`,
    );
  }

  return result;
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoleIcon(name = "") {
  const value = name.toLowerCase();

  if (value.includes("data")) return BarChart3;
  if (value.includes("devops") || value.includes("cloud")) return Cloud;
  if (value.includes("database")) return Database;
  if (value.includes("front")) return Layers3;
  if (value.includes("qa") || value.includes("test")) return ShieldCheck;
  if (value.includes("full stack")) return BriefcaseBusiness;

  return Code2;
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
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

function IconTile({ children, className = "" }) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ${className}`}
    >
      {children}
    </div>
  );
}

function FormField({ label, children, required, hint }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`my-auto w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } overflow-hidden rounded-3xl bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  onCancel,
  onConfirm,
  loading = false,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
      >
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Trash2 size={27} />
          </div>
          <h2
            id="confirm-dialog-title"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-message"
            className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-500"
          >
            {message}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function JobRole() {
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillLevels, setSkillLevels] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [requiredSkillsByRole, setRequiredSkillsByRole] = useState({});

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [roleModal, setRoleModal] = useState(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [roleFormError, setRoleFormError] = useState("");

  const [viewRole, setViewRole] = useState(null);

  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL);
  const [skillFormError, setSkillFormError] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [menuRoleId, setMenuRoleId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

  const selectedRole = useMemo(
    () =>
      roles.find((role) => String(role.jobRoleId) === String(selectedRoleId)) ||
      null,
    [roles, selectedRoleId],
  );

  const selectedSkills = useMemo(
    () =>
      skills.filter(
        (skill) =>
          String(skill.skillCategoryId) === String(skillForm.skillCategoryId),
      ),
    [skills, skillForm.skillCategoryId],
  );

  const filteredRoles = useMemo(() => {
    const value = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !value ||
        role.jobRoleName.toLowerCase().includes(value) ||
        role.description.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && role.isActive) ||
        (statusFilter === "inactive" && !role.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  const filteredRequiredSkills = useMemo(() => {
    const value = skillSearch.trim().toLowerCase();

    return requiredSkills.filter((skill) =>
      `${skill.skillName} ${skill.categoryName} ${skill.levelName}`
        .toLowerCase()
        .includes(value),
    );
  }, [requiredSkills, skillSearch]);

  const stats = useMemo(
    () => ({
      total: roles.length,
      active: roles.filter((role) => role.isActive).length,
      inactive: roles.filter((role) => !role.isActive).length,
      skills: skills.length,
    }),
    [roles, skills],
  );

  const loadRoles = useCallback(async (keepSelection = true) => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(API.jobRoles);
      const items = getItems(response).map(normalizeRole);

      setRoles(items);

      setSelectedRoleId((current) => {
        if (
          keepSelection &&
          items.some((role) => String(role.jobRoleId) === String(current))
        ) {
          return current;
        }

        return items[0]?.jobRoleId ?? null;
      });
    } catch (err) {
      setError(err.message || "Unable to load job roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReferenceData = useCallback(async () => {
    try {
      const [categoryResponse, skillResponse, levelResponse] =
        await Promise.all([
          apiRequest(API.categories),
          apiRequest(API.skills),
          apiRequest(API.skillLevels),
        ]);

      setCategories(getItems(categoryResponse).map(normalizeCategory));
      setSkills(getItems(skillResponse).map(normalizeSkill));
      setSkillLevels(getItems(levelResponse).map(normalizeLevel));
    } catch (err) {
      setError(
        (current) => current || `Unable to load reference data. ${err.message}`,
      );
    }
  }, []);

  const loadRequiredSkills = useCallback(
    async (roleId) => {
      setSkillsLoading(true);

      try {
        const response = await apiRequest(API.jobRoleSkills);
        const allAssignments = getItems(response).map(normalizeRequiredSkill);

        // Load and enrich required skills for EVERY job role.
        const enrichedAssignments = allAssignments.map((assignment) => {
          const actualSkill = skills.find(
            (skill) => String(skill.skillId) === String(assignment.skillId),
          );

          const actualCategory = categories.find(
            (category) =>
              String(category.skillCategoryId) ===
              String(
                actualSkill?.skillCategoryId ?? assignment.skillCategoryId,
              ),
          );

          const level = skillLevels.find(
            (item) =>
              String(item.skillLevelId) === String(assignment.requiredLevel),
          );

          return {
            ...assignment,
            skillName:
              actualSkill?.skillName || assignment.skillName || "Unknown Skill",
            categoryName:
              actualCategory?.skillCategoryName ||
              actualSkill?.categoryName ||
              assignment.categoryName ||
              "Uncategorized",
            levelName: assignment.levelName || level?.levelName || "",
          };
        });

        // Group skills by jobRoleId.
        const groupedSkills = {};

        enrichedAssignments.forEach((skill) => {
          const key = String(skill.jobRoleId);

          if (!groupedSkills[key]) {
            groupedSkills[key] = [];
          }

          groupedSkills[key].push(skill);
        });

        // Store skills for all roles.
        setRequiredSkillsByRole(groupedSkills);

        // Keep the existing selected-role state for the skill-management modal.
        setRequiredSkills(
          roleId === null || roleId === undefined || roleId === ""
            ? []
            : groupedSkills[String(roleId)] || [],
        );
      } catch (err) {
        setRequiredSkills([]);
        setRequiredSkillsByRole({});
        setError(`Unable to load required skills: ${err.message}`);
      } finally {
        setSkillsLoading(false);
      }
    },
    [skills, categories, skillLevels],
  );

  useEffect(() => {
    loadRoles(false);
    loadReferenceData();
  }, [loadRoles, loadReferenceData]);

  useEffect(() => {
    loadRequiredSkills(selectedRoleId);
  }, [selectedRoleId, loadRequiredSkills]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function openCreateRole() {
    setRoleForm({ ...EMPTY_ROLE });
    setRoleFormError("");
    setRoleModal({ mode: "create" });
    setMenuRoleId(null);
  }

  function openEditRole(role) {
    setRoleForm({
      jobRoleName: role.jobRoleName,
      description: role.description,
      isActive: role.isActive,
    });

    setRoleFormError("");
    setRoleModal({ mode: "edit", role });
    setMenuRoleId(null);
    setViewRole(null);
  }

  function updateRoleForm(event) {
    const { name, value, type, checked } = event.target;

    setRoleForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveRole(event) {
    event.preventDefault();
    setRoleFormError("");

    if (!roleForm.jobRoleName.trim()) {
      setRoleFormError("Please enter a job role name.");
      return;
    }

    setSaving(true);

    const payload = {
      jobRoleName: roleForm.jobRoleName.trim(),
      description: roleForm.description.trim(),
      isActive: roleForm.isActive,
    };

    try {
      if (roleModal.mode === "create") {
        const result = await apiRequest(API.jobRoles, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const newId = readValue(result, "jobRoleId", "JobRoleId", "id", "Id");

        setRoleModal(null);
        setNotice("Job role created successfully.");

        await loadRoles(false);

        if (newId !== undefined && newId !== null) {
          setSelectedRoleId(newId);
        }
      } else {
        const roleId = roleModal.role.jobRoleId;

        await apiRequest(`${API.jobRoles}/${encodeURIComponent(roleId)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setRoles((current) =>
          current.map((role) =>
            String(role.jobRoleId) === String(roleId)
              ? { ...role, ...payload }
              : role,
          ),
        );

        setRoleModal(null);
        setNotice("Job role updated successfully.");
      }
    } catch (err) {
      setRoleFormError(err.message || "Unable to save this job role.");
    } finally {
      setSaving(false);
    }
  }

  function deleteRole(role) {
    setMenuRoleId(null);
    setConfirmDialog({
      title: "Delete Job Role?",
      message: `Are you sure you want to delete "${role.jobRoleName}"?\n\nThis action cannot be undone. Deletion may fail if other records depend on this role.`,
      confirmText: "Delete Role",
      onConfirm: () => confirmDeleteRole(role),
    });
  }

  async function confirmDeleteRole(role) {
    setSaving(true);
    setError("");

    try {
      await apiRequest(
        `${API.jobRoles}/${encodeURIComponent(role.jobRoleId)}`,
        { method: "DELETE" },
      );

      setRoles((current) =>
        current.filter(
          (item) => String(item.jobRoleId) !== String(role.jobRoleId),
        ),
      );

      setRequiredSkillsByRole((current) => {
        const updated = { ...current };
        delete updated[String(role.jobRoleId)];
        return updated;
      });

      setSelectedRoleId((current) =>
        String(current) === String(role.jobRoleId) ? null : current,
      );

      setViewRole(null);
      setConfirmDialog(null);
      setNotice("Job role deleted successfully.");
    } catch (err) {
      setConfirmDialog(null);
      setError(err.message || "Unable to delete this job role.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRoleStatus(role) {
    setMenuRoleId(null);

    const newStatus = !role.isActive;

    try {
      await apiRequest(
        `${API.jobRoles}/${encodeURIComponent(role.jobRoleId)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            jobRoleName: role.jobRoleName,
            description: role.description,
            isActive: newStatus,
          }),
        },
      );

      setRoles((current) =>
        current.map((item) =>
          String(item.jobRoleId) === String(role.jobRoleId)
            ? { ...item, isActive: newStatus }
            : item,
        ),
      );

      setNotice(`Job role ${newStatus ? "activated" : "deactivated"}.`);
    } catch (err) {
      setError(err.message || "Unable to update role status.");
    }
  }

  function openManageSkills(role = selectedRole) {
    if (!role) return;

    setSelectedRoleId(role.jobRoleId);
    setSkillForm({ ...EMPTY_SKILL });
    setSkillFormError("");
    setSkillSearch("");
    setViewRole(null);
    setSkillModalOpen(true);
  }

  async function addRequiredSkill(event) {
    event.preventDefault();
    setSkillFormError("");

    const role = roles.find(
      (item) => String(item.jobRoleId) === String(selectedRoleId),
    );

    if (!role) {
      setSkillFormError("Select a job role first.");
      return;
    }

    if (!skillForm.skillCategoryId || !skillForm.skillId) {
      setSkillFormError("Select a category and a skill.");
      return;
    }

    if (!skillForm.requiredLevel) {
      setSkillFormError("Select the required proficiency level.");
      return;
    }

    const alreadyAssigned = requiredSkills.some(
      (item) => String(item.skillId) === String(skillForm.skillId),
    );

    if (alreadyAssigned) {
      setSkillFormError("This skill is already assigned to this role.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest(API.jobRoleSkills, {
        method: "POST",
        body: JSON.stringify({
          jobRoleId: role.jobRoleId,
          skillId: Number(skillForm.skillId),
          requiredSkillLevelId: Number(skillForm.requiredLevel),
          isMandatory: skillForm.isMandatory,
        }),
      });

      setSkillModalOpen(false);
      setSkillForm({ ...EMPTY_SKILL });
      setNotice("Required skill added successfully.");

      await loadRequiredSkills(role.jobRoleId);
    } catch (err) {
      setSkillFormError(err.message || "Unable to add this required skill.");
    } finally {
      setSaving(false);
    }
  }

  function removeRequiredSkill(skill, role = viewRole || selectedRole) {
    const roleId = role?.jobRoleId ?? skill?.jobRoleId ?? selectedRoleId;
    const skillId = skill?.skillId;

    if (
      roleId === null ||
      roleId === undefined ||
      roleId === "" ||
      skillId === null ||
      skillId === undefined ||
      skillId === ""
    ) {
      setError(
        "Cannot remove this skill because its role or skill ID is missing.",
      );
      return;
    }

    setConfirmDialog({
      title: "Remove Required Skill?",
      message: `Are you sure you want to remove "${skill.skillName}" from "${role?.jobRoleName || "this role"}"?\n\nThe skill will be removed from this role only. The skill itself will remain in your SkillMesh catalog.`,
      confirmText: "Remove Skill",
      onConfirm: () => confirmRemoveRequiredSkill(skill, role, roleId, skillId),
    });
  }

  async function confirmRemoveRequiredSkill(skill, role, roleId, skillId) {
    setSaving(true);
    setError("");

    try {
      // JobRoleSkills uses (JobRoleId, SkillId) as its composite key.
      await apiRequest(
        `${API.jobRoleSkills}/${encodeURIComponent(roleId)}/${encodeURIComponent(skillId)}`,
        { method: "DELETE" },
      );

      setRequiredSkills((current) =>
        current.filter(
          (item) =>
            !(
              String(item.jobRoleId) === String(roleId) &&
              String(item.skillId) === String(skillId)
            ),
        ),
      );

      setRequiredSkillsByRole((current) => ({
        ...current,
        [String(roleId)]: (current[String(roleId)] || []).filter(
          (item) => String(item.skillId) !== String(skillId),
        ),
      }));

      setConfirmDialog(null);
      setNotice(`"${skill.skillName}" was removed from the role successfully.`);
    } catch (err) {
      setConfirmDialog(null);
      setError(
        `Unable to remove "${skill.skillName}". ${err.message || "Please check the API."}`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshPage() {
    await Promise.all([loadRoles(true), loadReferenceData()]);
  }

  return (
    <DashboardLayout role="Super Admin" title="Job Roles">
      <div className="min-h-screen bg-[#F5F7FC] text-slate-800">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* PAGE HEADER */}
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                <BriefcaseBusiness size={15} />
                Career configuration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#14213D] sm:text-4xl">
                Job Roles
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage career roles, explore their requirements, and define the
                skills learners need to achieve their career goals.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={refreshPage}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateRole}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Job Role
              </button>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Job Roles
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Career roles in catalog
                  </p>
                </div>
                <IconTile className="h-14 w-14 rounded-2xl">
                  <BriefcaseBusiness size={24} />
                </IconTile>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Roles
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {stats.active}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Available for career planning
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={25} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Inactive Roles
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-700">
                    {stats.inactive}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Currently unavailable
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Activity size={25} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Available Skills
                  </p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">
                    {stats.skills}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Skills available for assignment
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Code2 size={25} />
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by job role name or description..."
                  className={`${inputClass} pl-10`}
                  aria-label="Search job roles"
                />
              </div>

              <div className="relative lg:w-52">
                <Filter
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={`${inputClass} appearance-none pl-10 pr-10`}
                  aria-label="Filter by role status"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <span className="text-sm text-slate-500 lg:ml-2">
                Showing{" "}
                <strong className="text-slate-800">
                  {filteredRoles.length}
                </strong>{" "}
                of <strong className="text-slate-800">{roles.length}</strong>{" "}
                roles
              </span>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-lg p-1 hover:bg-rose-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* FULL-WIDTH JOB ROLE CARDS */}
          {loading ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <LoaderCircle className="animate-spin text-blue-600" size={30} />
              <span className="ml-3 text-sm text-slate-500">
                Loading job roles...
              </span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness size={29} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {roles.length === 0
                  ? "No job roles available"
                  : "No matching job roles"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {roles.length === 0
                  ? "Create your first job role to start defining career requirements."
                  : "Try changing the search text or status filter."}
              </p>

              {roles.length === 0 ? (
                <button
                  type="button"
                  onClick={openCreateRole}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Create Job Role
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredRoles.map((role) => {
                const RoleIcon = getRoleIcon(role.jobRoleName);
                const isSelected =
                  String(role.jobRoleId) === String(selectedRoleId);

                const roleSkills =
                  requiredSkillsByRole[String(role.jobRoleId)] || [];

                return (
                  <article
                    key={role.jobRoleId}
                    className="group relative flex min-w-0 flex-col overflow-visible rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/[0.06] sm:p-6"
                  >
                    {/* Card heading */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 transition group-hover:from-blue-100 group-hover:to-indigo-100">
                        <RoleIcon size={27} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="break-words text-lg font-bold leading-6 text-slate-900">
                          {role.jobRoleName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Role ID: {role.jobRoleId}
                        </p>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setMenuRoleId((current) =>
                              String(current) === String(role.jobRoleId)
                                ? null
                                : role.jobRoleId,
                            )
                          }
                          aria-label={`More actions for ${role.jobRoleName}`}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreVertical size={19} />
                        </button>

                        {String(menuRoleId) === String(role.jobRoleId) && (
                          <>
                            <button
                              type="button"
                              aria-label="Close actions menu"
                              className="fixed inset-0 z-10 cursor-default"
                              onClick={() => setMenuRoleId(null)}
                            />
                            <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuRoleId(null);
                                  setViewRole(role);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye size={15} />
                                View details
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditRole(role)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Edit3 size={15} />
                                Edit role
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleRoleStatus(role)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Activity size={15} />
                                {role.isActive ? "Deactivate" : "Activate"}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteRole(role)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 size={15} />
                                Delete role
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status and date */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge active={role.isActive} />
                      <span className="text-xs text-slate-400">
                        Created {formatDate(role.createdAt)}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-5 flex-1">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Role description
                      </p>
                      <p className="line-clamp-3 min-h-[60px] break-words text-sm leading-5 text-slate-600">
                        {role.description || "No description provided."}
                      </p>
                    </div>

                    {/* Skill preview */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ShieldCheck size={17} className="text-blue-600" />
                          Required skills
                        </span>

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {roleSkills.length}
                        </span>
                      </div>

                      {skillsLoading ? (
                        <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
                          <LoaderCircle size={15} className="animate-spin" />
                          Loading skills...
                        </div>
                      ) : roleSkills.length > 0 ? (
                        <div className="flex min-h-10 flex-wrap gap-2">
                          {roleSkills.slice(0, 4).map((skill) => (
                            <span
                              key={
                                skill.jobRoleSkillId ??
                                `${skill.skillId}-${skill.skillName}`
                              }
                              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1.5 text-xs font-medium text-blue-800"
                            >
                              <Code2 size={12} className="shrink-0" />
                              <span className="truncate">
                                {skill.skillName}
                              </span>
                            </span>
                          ))}

                          {roleSkills.length > 4 && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                              +{roleSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-xs text-slate-500">
                          No required skills assigned to this role yet.
                        </p>
                      )}
                    </div>

                    {/* Card actions */}
                    <div className="mt-5 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setViewRole(role)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={16} />
                        View details
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditRole(role)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Edit3 size={15} />
                        Edit role
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openManageSkills(role)}
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Settings2 size={16} />
                      Manage required skills
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* VIEW COMPLETE DETAILS POPUP */}
        {viewRole && (
          <Modal
            title="Job Role Details"
            subtitle="Complete career role information and required skills."
            onClose={() => setViewRole(null)}
            wide
          >
            {(() => {
              const RoleIcon = getRoleIcon(viewRole.jobRoleName);

              const viewSkills =
                requiredSkillsByRole[String(viewRole.jobRoleId)] || [];

              return (
                <div className="space-y-5 p-5 sm:p-6">
                  {/* Role identity */}
                  <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
                        <RoleIcon size={31} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-words text-2xl font-bold text-[#14213D]">
                            {viewRole.jobRoleName}
                          </h3>
                          <StatusBadge active={viewRole.isActive} />
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {viewRole.description ||
                            "No description has been added for this role."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                            Role ID: {viewRole.jobRoleId}
                          </span>
                          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                            Created: {formatDate(viewRole.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail information */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <BriefcaseBusiness size={18} />
                      </div>
                      <p className="text-xs text-slate-500">Job role name</p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {viewRole.jobRoleName}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Activity size={18} />
                      </div>
                      <p className="text-xs text-slate-500">Current status</p>
                      <div className="mt-2">
                        <StatusBadge active={viewRole.isActive} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                        <BookOpen size={18} />
                      </div>
                      <p className="text-xs text-slate-500">Required skills</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {
                          (
                            requiredSkillsByRole[String(viewRole.jobRoleId)] ||
                            []
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  {/* Complete description */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      <h4 className="font-bold text-slate-900">
                        Role description
                      </h4>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {viewRole.description || "No description provided."}
                    </p>
                  </div>

                  {/* Required skills */}
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-900">
                          <ShieldCheck size={19} className="text-blue-600" />
                          Required skills
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Skills and proficiency expectations for this role.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openManageSkills(viewRole)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Plus size={15} />
                        Add skill
                      </button>
                    </div>

                    {skillsLoading ? (
                      <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                        <LoaderCircle size={20} className="mr-2 animate-spin" />
                        Loading required skills...
                      </div>
                    ) : viewSkills.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                        <Sparkles
                          size={25}
                          className="mx-auto mb-3 text-blue-500"
                        />
                        <p className="text-sm font-semibold text-slate-800">
                          No required skills assigned
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Add skills to define the expectations for this role.
                        </p>
                        <button
                          type="button"
                          onClick={() => openManageSkills(viewRole)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          <Plus size={15} />
                          Assign a skill
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {viewSkills.map((skill) => (
                          <div
                            key={
                              skill.jobRoleSkillId ??
                              `${skill.skillId}-${skill.skillName}`
                            }
                            className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 p-3.5"
                          >
                            <IconTile className="h-10 w-10 rounded-xl">
                              <Code2 size={19} />
                            </IconTile>

                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-bold text-slate-800">
                                {skill.skillName}
                              </p>
                              <p className="mt-1 break-words text-xs text-slate-500">
                                {skill.categoryName || "Uncategorized"}
                              </p>

                              <p className="mt-2 text-xs font-semibold text-blue-700">
                                Proficiency:{" "}
                                {skill.levelName || "Not specified"}
                              </p>

                              <span
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  skill.isMandatory
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {skill.isMandatory ? "Mandatory" : "Optional"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeRequiredSkill(skill, viewRole)
                              }
                              title={`Remove ${skill.skillName}`}
                              aria-label={`Remove ${skill.skillName}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Popup footer */}
                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditRole(viewRole)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit3 size={16} />
                      Edit role
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewRole(null)}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </Modal>
        )}

        {/* CREATE / EDIT ROLE POPUP */}
        {roleModal && (
          <Modal
            title={
              roleModal.mode === "create" ? "Create Job Role" : "Edit Job Role"
            }
            subtitle={
              roleModal.mode === "create"
                ? "Add a new career role to the SkillMesh catalog."
                : "Update the career role details."
            }
            onClose={() => setRoleModal(null)}
          >
            <form onSubmit={saveRole} className="space-y-5 p-6">
              <FormField label="Job role name" required>
                <input
                  name="jobRoleName"
                  value={roleForm.jobRoleName}
                  onChange={updateRoleForm}
                  placeholder="e.g. Backend Developer"
                  className={inputClass}
                  maxLength={150}
                  autoFocus
                />
              </FormField>

              <FormField
                label="Description"
                hint="Describe the responsibilities and expectations of this role."
              >
                <textarea
                  name="description"
                  value={roleForm.description}
                  onChange={updateRoleForm}
                  placeholder="Describe the role and its main responsibilities..."
                  rows={4}
                  maxLength={1000}
                  className={`${inputClass} resize-y`}
                />
              </FormField>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Active role
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Make this role available for career planning.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isActive"
                  checked={roleForm.isActive}
                  onChange={updateRoleForm}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              {roleFormError && (
                <p className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  {roleFormError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setRoleModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {roleModal.mode === "create" ? "Create Role" : "Save Changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* MANAGE REQUIRED SKILLS POPUP */}
        {skillModalOpen && (
          <Modal
            title="Manage Required Skills"
            subtitle={`Choose a category, skill, and proficiency level for ${
              selectedRole?.jobRoleName || "this role"
            }.`}
            onClose={() => setSkillModalOpen(false)}
            wide
          >
            <form onSubmit={addRequiredSkill} className="space-y-5 p-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Configure a role skill
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Skill categories, skills, and proficiency levels are
                      loaded from your backend APIs.
                    </p>
                  </div>
                </div>
              </div>

              <FormField label="Skill category" required>
                <div className="relative">
                  <select
                    value={skillForm.skillCategoryId}
                    onChange={(event) =>
                      setSkillForm((current) => ({
                        ...current,
                        skillCategoryId: event.target.value,
                        skillId: "",
                      }))
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select a category</option>

                    {categories.map((category) => (
                      <option
                        key={category.skillCategoryId}
                        value={category.skillCategoryId}
                      >
                        {category.skillCategoryName}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {categories.length === 0 && (
                  <span className="block text-xs text-amber-600">
                    No categories loaded. Check the SkillCategory API.
                  </span>
                )}
              </FormField>

              <FormField label="Skill" required>
                <div className="relative">
                  <select
                    value={skillForm.skillId}
                    onChange={(event) =>
                      setSkillForm((current) => ({
                        ...current,
                        skillId: event.target.value,
                      }))
                    }
                    disabled={!skillForm.skillCategoryId}
                    className={`${inputClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                  >
                    <option value="">
                      {!skillForm.skillCategoryId
                        ? "Select a category first"
                        : selectedSkills.length
                          ? "Select a skill"
                          : "No skills in this category"}
                    </option>

                    {selectedSkills.map((skill) => (
                      <option key={skill.skillId} value={skill.skillId}>
                        {skill.skillName}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </FormField>

              <FormField
                label="Required proficiency level"
                required
                hint="Choose the proficiency level expected for this skill."
              >
                <div className="relative">
                  <select
                    value={skillForm.requiredLevel}
                    onChange={(event) =>
                      setSkillForm((current) => ({
                        ...current,
                        requiredLevel: event.target.value,
                      }))
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select proficiency level</option>

                    {skillLevels.map((level) => (
                      <option
                        key={level.skillLevelId}
                        value={level.skillLevelId}
                      >
                        {level.levelName}
                        {level.levelNumber !== undefined &&
                        level.levelNumber !== null
                          ? ` (Level ${level.levelNumber})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {skillLevels.length === 0 && (
                  <span className="block text-xs text-amber-600">
                    No proficiency levels loaded. Check the SkillLevel API.
                  </span>
                )}
              </FormField>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Mandatory skill
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Mark whether this skill is essential for the role.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={skillForm.isMandatory}
                  onChange={(event) =>
                    setSkillForm((current) => ({
                      ...current,
                      isMandatory: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              {skillFormError && (
                <p className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  {skillFormError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setSkillModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !selectedRole}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Assign Skill
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* CUSTOM DELETE / REMOVE CONFIRMATION DIALOG */}
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText={confirmDialog.confirmText}
            loading={saving}
            onCancel={() => {
              if (!saving) setConfirmDialog(null);
            }}
            onConfirm={() => {
              if (!saving) confirmDialog.onConfirm();
            }}
          />
        )}

        {/* SUCCESS NOTIFICATION */}
        {notice && (
          <div className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3.5 shadow-xl shadow-slate-900/10">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>

            <p className="min-w-0 flex-1 text-sm font-medium text-slate-700">
              {notice}
            </p>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
