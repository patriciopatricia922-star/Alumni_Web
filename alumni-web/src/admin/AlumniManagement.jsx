import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseadmin";
import AlumniManagementView from "./views/Alumnimanagementview";

const PER_PAGE = 5;

function AlumniManagement() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ completed: 0, pending: 0, active: 0, deactivated: 0 });
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    program: "",
    batch: "",
    employmentStatus: "",
    surveyStatus: "",
  });
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const calcStats = (data) => ({
    completed: data.filter((a) => a.survey_status === "completed").length,
    pending: data.filter((a) => a.survey_status === "pending").length,
    active: data.filter((a) => a.account_status === "active").length,
    deactivated: data.filter((a) =>
      a.account_status === "deactivated" || a.account_status === "inactive"
    ).length,
  });

  const loadAlumni = async () => {
    try {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, first_name, middle_name, last_name, program, batch_year, account_status, role")
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
          try { empData = JSON.parse(empData); } catch (_) { empData = {}; }
        }
        empData = empData || {};
        
        let employmentStatus = empData.employmentStatus
          ?? empData.employment_status
          ?? empData.status
          ?? null;
        
        if (employmentStatus) {
          const lowerStatus = employmentStatus.toLowerCase();
          if (lowerStatus === "regular / permanent" || lowerStatus === "employed") employmentStatus = "Employed";
          else if (lowerStatus === "unemployed") employmentStatus = "Unemployed";
          else if (lowerStatus === "student") employmentStatus = "Student";
          else if (lowerStatus.includes("seek")) employmentStatus = "Seeking";
          else if (lowerStatus.includes("further")) employmentStatus = "Further Studies";
          else if (lowerStatus.includes("self")) employmentStatus = "Self-Employed";
        }
        
        surveyMap[s.user_id] = {
          survey_status: s.completed ? "completed" : "pending",
          percentage: s.percentage ?? 0,
          employment_status: employmentStatus || null,
          job_position: empData.jobTitle ?? empData.job_title ?? empData.position ?? empData.jobPosition ?? null,
          job_company: empData.companyName ?? empData.company ?? empData.employer ?? null,
        };
      });

      const merged = (users || []).map((u) => {
        const survey = surveyMap[u.id] || {};
        const fullName = [u.first_name, u.middle_name, u.last_name]
          .filter(Boolean).join(" ");
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
      
      // Extract unique programs and batches for filters
      const programs = [...new Set(merged.map(a => a.program).filter(p => p !== "—"))].sort();
      const batches = [...new Set(merged.map(a => a.batch).filter(b => b !== "—"))].sort((a, b) => Number(b) - Number(a));
      setAvailablePrograms(programs);
      setAvailableBatches(batches);
    } catch (e) {
      console.error("loadAlumni error:", e);
    }
  };

  useEffect(() => { loadAlumni(); }, []);

  // Update account status function
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

  const applyFilters = (alumniList) => {
    return alumniList.filter((a) => {
      if (filters.program && a.program !== filters.program) return false;
      if (filters.batch && a.batch !== filters.batch) return false;
      if (filters.employmentStatus && a.employment_status !== filters.employmentStatus) return false;
      if (filters.surveyStatus) {
        const status = a.survey_status === "completed" ? "Completed" : "Pending";
        if (status !== filters.surveyStatus) return false;
      }
      return true;
    });
  };

  const applySearch = (alumniList) => {
    return alumniList.filter((a) =>
      [a.name, a.email, a.program].some((f) =>
        (f ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const filteredByFilters = applyFilters(alumni);
  const filtered = applySearch(filteredByFilters);
  
  const total = alumni.length || 1;
  const completedPct = Math.round((stats.completed / total) * 100);
  const pendingPct = Math.round((stats.pending / total) * 100);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry = Math.min(page * PER_PAGE, filtered.length);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage(p => Math.min(totalPages, p + 1));
  };

  const handleGoToPage = (p) => {
    setPage(p);
  };

  const handleSelectAlumni = (alumni) => {
    setSelectedAlumni(alumni);
  };

  const handleCloseModal = () => {
    setSelectedAlumni(null);
  };

  const handleOpenFilter = () => {
    setShowFilter(true);
  };

  const handleCloseFilter = () => {
    setShowFilter(false);
  };

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
    });
    setPage(1);
    setShowFilter(false);
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Program", "Batch", "Employment Status", "Survey Status", "Account Status"];
    const csvData = filtered.map(a => [
      a.name,
      a.email,
      a.program,
      a.batch,
      a.employment_status || "—",
      a.survey_status === "completed" ? "Completed" : "Pending",
      a.account_status === "active" ? "Active" : "Inactive"
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alumni_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = filters.program || filters.batch || filters.employmentStatus || filters.surveyStatus;

  return (
    <AlumniManagementView
      alumni={alumni}
      stats={stats}
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
      onOpenFilter={handleOpenFilter}
      onCloseFilter={handleCloseFilter}
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
    />
  );
}

export default AlumniManagement;