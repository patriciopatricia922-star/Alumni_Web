// ============================================================================
// THIS IS FOR LOGIC. SuperAdminAlumni
// ============================================================================
// Purpose: Handles all business logic, Supabase API calls, data processing,
//          filtering, pagination, state management, CSV upload, and event
//          handlers for alumni management.
// ============================================================================

import { useEffect, useState } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import SuperAdminAlumniView from "./Views/SuperAdminAlumniView";
import { isSHSProgram, isCollegeProgram } from "../utils/alumniUtils";
import { useAlumniType } from "./contexts/AlumniTypeContext";

const PER_PAGE = 12;

function SuperAdminAlumni() {
  
  const { alumniType } = useAlumniType();
  // ── State ────────────────────────────────────────────────────────────────
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    active: 0,
    deactivated: 0,
  });
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    program: "",
    batch: "",
    employmentStatus: "",
    surveyStatus: "",
    sortOrder: "",
  });
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);

  // ── Responsive handler ───────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Statistics calculation ───────────────────────────────────────────────
  const calcStats = (data) => ({
    completed: data.filter((a) => a.survey_status === "completed").length,
    pending: data.filter((a) => a.survey_status === "pending").length,
    active: data.filter((a) => a.account_status === "active").length,
    deactivated: data.filter(
      (a) => a.account_status === "deactivated" || a.account_status === "inactive"
    ).length,
  });

  // ── Load alumni data ─────────────────────────────────────────────────────
  const loadAlumni = async () => {
    try {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select(
          "id, email, first_name, middle_name, last_name, program, batch_year, account_status, role"
        )
        .eq("role", "alumni");

      if (usersError) throw usersError;

      const { data: surveys, error: surveyError } = await supabaseAdmin
        .from("survey_progress")
        .select("user_id, completed, percentage, employment_information_data");

      if (surveyError) throw surveyError;

      const surveyMap = {};
      (surveys || []).forEach((s) => {
        let empData = s.employment_information_data;
        if (typeof empData === "string") {
          try {
            empData = JSON.parse(empData);
          } catch (_) {
            empData = {};
          }
        }
        empData = empData || {};

        let employmentStatus =
          empData.employmentStatus ??
          empData.employment_status ??
          empData.status ??
          null;

        if (employmentStatus) {
          const lower = employmentStatus.toLowerCase();
          if (lower === "regular / permanent" || lower === "employed")
            employmentStatus = "Employed";
          else if (lower === "unemployed") employmentStatus = "Unemployed";
          else if (lower === "student") employmentStatus = "Student";
          else if (lower.includes("seek")) employmentStatus = "Seeking";
          else if (lower.includes("further")) employmentStatus = "Further Studies";
          else if (lower.includes("self")) employmentStatus = "Self-Employed";
        }

        surveyMap[s.user_id] = {
          survey_status: s.completed ? "completed" : "pending",
          percentage: s.percentage ?? 0,
          employment_status: employmentStatus || null,
          job_position:
            empData.jobTitle ??
            empData.job_title ??
            empData.position ??
            empData.jobPosition ??
            null,
          job_company:
            empData.companyName ?? empData.company ?? empData.employer ?? null,
        };
      });

      const merged = (users || []).map((u) => {
        const survey = surveyMap[u.id] || {};
        const fullName = [u.first_name, u.middle_name, u.last_name]
          .filter(Boolean)
          .join(" ");
        return {
          id: u.id,
          name: fullName,
          email: u.email,
          program: u.program || "—",
          batch: u.batch_year ? String(u.batch_year) : "—",
          account_status: u.account_status ?? "active",
          survey_status: survey.survey_status ?? "pending",
          percentage: survey.percentage ?? 0,
          employment_status: survey.employment_status ?? null,
          job_position: survey.job_position ?? null,
          job_company: survey.job_company ?? null,
        };
      });

      setAlumni(merged);
      setStats(calcStats(merged));

      const programs = [
        ...new Set(merged.map((a) => a.program).filter((p) => p !== "—")),
      ].sort();
      const batches = [
        ...new Set(merged.map((a) => a.batch).filter((b) => b !== "—")),
      ].sort((a, b) => Number(b) - Number(a));

      setAvailablePrograms(programs);
      setAvailableBatches(batches);
    } catch (e) {
      console.error("loadAlumni error:", e);
    }
  };

   useEffect(() => {
    loadAlumni();
  }, []);

  // ── Cohort partitioning ───────────────────────────────────────────────────
  // Derived on every render — toggling alumniType costs zero extra DB calls.
  const cohortAlumni = alumni.filter((a) =>
    alumniType === "shs" ? isSHSProgram(a.program) : isCollegeProgram(a.program)
  );

  // Stats always reflect the active cohort so metric cards stay accurate.
  const cohortStats = calcStats(cohortAlumni);

  // ── Account status update ────────────────────────────────────────────────
  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ account_status: newStatus })
        .eq("id", id);
      if (error) throw error;

      const updated = alumni.map((a) =>
        a.id === id ? { ...a, account_status: newStatus } : a
      );
      setAlumni(updated);
      setStats(calcStats(updated));
    } catch (e) {
      console.error("updateStatus error:", e);
    }
  };

  // ── Filtering & sorting ──────────────────────────────────────────────────
  const applyFilters = (alumniList) => {
    let result = alumniList.filter((a) => {
      if (filters.program && a.program !== filters.program) return false;
      if (filters.batch && a.batch !== filters.batch) return false;
      if (filters.employmentStatus && a.employment_status !== filters.employmentStatus)
        return false;
      if (filters.surveyStatus) {
        const status = a.survey_status === "completed" ? "Completed" : "Pending";
        if (status !== filters.surveyStatus) return false;
      }
      return true;
    });

    if (filters.sortOrder === "A-Z") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortOrder === "Z-A") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  };

  const applySearch = (alumniList) =>
    alumniList.filter((a) =>
      [a.name, a.email, a.program].some((f) =>
        (f ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );

  const filteredByFilters = applyFilters(cohortAlumni);
  const filtered = applySearch(filteredByFilters);

  const total = cohortAlumni.length || 1;
  const completedPct = Math.round((cohortStats.completed / total) * 100);
  const pendingPct = Math.round((cohortStats.pending / total) * 100);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry = Math.min(page * PER_PAGE, filtered.length);

  // ── Event handlers ───────────────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [alumniType]);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleGoToPage = (p) => setPage(p);

  const handleSelectAlumni = (record) => setSelectedAlumni(record);
  const handleCloseModal = () => setSelectedAlumni(null);

  const handleOpenFilter = () => setShowFilter(true);
  const handleCloseFilter = () => setShowFilter(false);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setFilters({
      program: "",
      batch: "",
      employmentStatus: "",
      surveyStatus: "",
      sortOrder: "",
    });
    setPage(1);
    setShowFilter(false);
  };

  const handleOpenUploadModal = () => setShowUploadModal(true);
  const handleCloseUploadModal = () => setShowUploadModal(false);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadAlumni();
  };

  // ── Export to CSV ────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Program",
      "Batch",
      "Employment Status",
      "Survey Status",
      "Account Status",
    ];
    const csvData = filtered.map((a) => [
      a.name,
      a.email,
      a.program,
      a.batch,
      a.employment_status || "—",
      a.survey_status === "completed" ? "Completed" : "Pending",
      a.account_status === "active" ? "Active" : "Inactive",
    ]);

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alumni_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters =
    filters.program ||
    filters.batch ||
    filters.employmentStatus ||
    filters.surveyStatus;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SuperAdminAlumniView
      alumni={cohortAlumni}
      stats={cohortStats}
      search={search}
      page={page}
      isMobile={isMobile}
      selectedAlumni={selectedAlumni}
      completedPct={completedPct}
      pendingPct={pendingPct}
      filtered={filtered}
      totalPages={totalPages}
      paginated={paginated}
      startEntry={startEntry}
      endEntry={endEntry}
      setSearch={handleSearch}
      setPage={setPage}
      setSelectedAlumni={handleSelectAlumni}
      updateStatus={updateStatus}
      showFilter={showFilter}
      showUploadModal={showUploadModal}
      onOpenFilter={handleOpenFilter}
      onCloseFilter={handleCloseFilter}
      onOpenUploadModal={handleOpenUploadModal}
      onCloseUploadModal={handleCloseUploadModal}
      onUploadSuccess={handleUploadSuccess}
      onApplyFilters={handleApplyFilters}
      onClearFilters={handleClearFilters}
      onExport={handleExport}
      filters={filters}
      availablePrograms={availablePrograms}
      availableBatches={availableBatches}
      hasActiveFilters={hasActiveFilters}
      onPrevPage={handlePrevPage}
      onNextPage={handleNextPage}
      onGoToPage={handleGoToPage}
      onCloseModal={handleCloseModal}
      alumniType={alumniType}
    />
  );
}


export default SuperAdminAlumni;