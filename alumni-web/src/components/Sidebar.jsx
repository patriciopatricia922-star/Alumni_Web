import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from "../lib/surveyProgress";
import homeIcon from "../assets/home_icn.svg";
import aboutIcon from "../assets/about_icn.svg";
import surveyIcon from "../assets/tracer_ic.svg";
import profileIcon from "../assets/profile_icn.svg";
import sidebarLogo from "../assets/alumnai_logo_new.png";
import SidebarView from "./Sidebarview";
import DataPrivacyModal from "../modals/DataPrivacyModal";
import { useDpaGate } from "../hooks/useDpaGate";
import { useSurveyRewardClaim } from "../hooks/useSurveyRewardClaim";
import PointsToast from "../modals/PointsToast";

const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    points: 0,
    newBalance: 0,
    label: "",
  });
  const [surveyRoute, setSurveyRoute] = useState(null); // null = still resolving
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // ── DPA gate ──────────────────────────────────────────────────────────────
  const { showModal, requestNavigation, handleAccept, handleDecline } =
    useDpaGate(navigate);

  useSurveyRewardClaim({
    onPointsSynced: () => {},
    onClaimedStatus: () => {},
    onToast: setToast,
  });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // ── 1. Auth user ──────────────────────────────────────────────────────
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser || cancelled) return;

      // ── 2. Profile data ───────────────────────────────────────────────────
      const { data: profile } = await supabase
        .from("users")
        .select("first_name, last_name, email")
        .eq("id", authUser.id)
        .single();

      if (!cancelled && profile) setUser(profile);

      // ── 3. Survey route ───────────────────────────────────────────────────
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();

        if (cancelled) return;

        if (complete) {
          setSurveyRoute("/update-tracer");
        } else {
          const route = await getResumeRoute();
          if (!cancelled) setSurveyRoute(route);
        }
      } catch (err) {
        console.error("Sidebar: error resolving survey route:", err);
        if (!cancelled) setSurveyRoute("/survey/personal-background");
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived display values ────────────────────────────────────────────────
  const email = user?.email ?? "";
  const role =
    email === "superadmin@nu-dasma.edu.ph"
      ? "Super Admin"
      : email === "nudaao@nu-dasma.edu.ph"
        ? "Admin"
        : "Alumni";
  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : "Loading...";
  const initials = user?.first_name?.charAt(0).toUpperCase() ?? "U";

  // ── Nav click handler — gate the survey item through DPA ─────────────────
  const handleNavClick = (item) => {
  if (!item.navPath) return;

  const isSurveyItem = item.path === "/survey";
  if (isSurveyItem) {
    if (item.navPath === "/update-tracer") {
      sessionStorage.setItem("survey_origin_route", location.pathname);
      navigate(item.navPath);
    } else {
      sessionStorage.setItem("survey_origin_route", location.pathname);
      requestNavigation(item.navPath);
    }
  } else {
    navigate(item.navPath);
  }
};

  const menuItems = [
    {
      path: "/dashboard",
      label: "Home",
      icon: homeIcon,
      navPath: "/dashboard",
      loading: false,
    },
    {
      path: "/survey",
      label: "Tracer Survey",
      icon: surveyIcon,
      navPath: surveyRoute,
      loading: !surveyRoute,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: profileIcon,
      navPath: "/profile",
      loading: false,
    },
  ];

  const helpItems = [{ path: "/about", label: "About", icon: aboutIcon }];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      {showModal && (
        <DataPrivacyModal onAccept={handleAccept} onDecline={handleDecline} />
      )}

      <PointsToast
        visible={toast.visible}
        points={toast.points}
        newBalance={toast.newBalance}
        label={toast.label}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <SidebarView
        location={location}
        isMobile={isMobile}
        isTablet={isTablet}
        user={user}
        role={role}
        displayName={displayName}
        initials={initials}
        menuItems={menuItems}
        helpItems={helpItems}
        sidebarLogo={sidebarLogo}
        handleLogout={handleLogout}
        onNavClick={handleNavClick}
      />
    </>
  );
};

export default Sidebar;
