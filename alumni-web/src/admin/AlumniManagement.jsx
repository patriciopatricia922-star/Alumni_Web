import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseadmin";
import AdminSidebar from "./AdminSidebar";
import AlumniManagementView from "./views/Alumnimanagementview";

const PER_PAGE = 5;

function AlumniManagement() {
  const navigate = useNavigate();
  const [alumni,         setAlumni]         = useState([]);
  const [search,         setSearch]         = useState("");
  const [stats,          setStats]          = useState({ completed:0, pending:0, active:0, deactivated:0 });
  const [page,           setPage]           = useState(1);
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 900);
  const [selectedAlumni, setSelectedAlumni] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const calcStats = (data) => ({
    completed:   data.filter((a) => a.survey_status  === "completed").length,
    pending:     data.filter((a) => a.survey_status  === "pending").length,
    active:      data.filter((a) => a.account_status === "active").length,
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
        surveyMap[s.user_id] = {
          survey_status:     s.completed ? "completed" : "pending",
          percentage:        s.percentage ?? 0,
          employment_status: empData.employmentStatus
                          ?? empData.employment_status
                          ?? empData.status
                          ?? null,
          job_position:      empData.jobTitle
                          ?? empData.job_title
                          ?? empData.position
                          ?? empData.jobPosition
                          ?? null,
          job_company:       empData.companyName
                          ?? empData.company
                          ?? empData.employer
                          ?? null,
        };
      });

      const merged = (users || []).map((u) => {
        const survey = surveyMap[u.id] || {};
        const fullName = [u.first_name, u.middle_name, u.last_name]
          .filter(Boolean).join(" ");
        return {
          id:                u.id,
          name:              fullName,
          email:             u.email,
          program:           u.program || "—",
          batch:             u.batch_year ? String(u.batch_year) : "—",
          account_status:    u.account_status ?? "active",
          survey_status:     survey.survey_status     ?? "pending",
          percentage:        survey.percentage        ?? 0,
          employment_status: survey.employment_status ?? null,
          job_position:      survey.job_position      ?? null,
          job_company:       survey.job_company       ?? null,
        };
      });

      setAlumni(merged);
      setStats(calcStats(merged));
    } catch (e) {
      console.error("loadAlumni error:", e);
    }
  };

  useEffect(() => { loadAlumni(); }, []);

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

  const total        = alumni.length || 1;
  const completedPct = Math.round((stats.completed / total) * 100);
  const pendingPct   = Math.round((stats.pending   / total) * 100);

  const filtered = alumni.filter((a) =>
    [a.name, a.email, a.program].some((f) =>
      (f ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry   = Math.min(page * PER_PAGE, filtered.length);

  return (
    <>
      <AdminSidebar />
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
        setSearch={(val) => { setSearch(val); setPage(1); }}
        setPage={setPage}
        setSelectedAlumni={setSelectedAlumni}
        updateStatus={updateStatus}
      />
    </>
  );
}

export default AlumniManagement;