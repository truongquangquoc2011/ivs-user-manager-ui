"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AuthProvider, useAuth } from "@/src/hook/useAuth";
import PageTransition from "@/src/components/PageTransition";

function useNavItems() {
  const t = useTranslations("dashboard.nav");
  const locale = useLocale();

  const NAV_ITEMS = [
    {
      href: `/${locale}/dashboard/user`,
      label: t("user"),
      feature: "USER_MANAGEMENT",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/group`,
      label: t("group"),
      feature: "GROUP_MANAGEMENT",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/permission`,
      label: t("permission"),
      feature: "PERMISSION_MANAGEMENT",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/profile`,
      label: t("profile"),
      feature: "PROFILE",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  const BOTTOM_NAV = [
    {
      href: `/${locale}/dashboard/settings`,
      label: t("settings"),
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/notifications`,
      label: t("notifications"),
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return { NAV_ITEMS, BOTTOM_NAV };
}

function NavItem({
  href,
  label,
  icon,
  active,
  collapsed,
  onExpandRequest,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  onExpandRequest?: () => void;
}) {
  return (
    <Link
      href={collapsed ? "#" : href}
      title={collapsed ? label : undefined}
      onClick={(e) => {
        if (collapsed) {
          e.preventDefault();
          onExpandRequest?.();
        }
      }}
      className="sidebar-nav-item group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-150"
      style={{
        padding: collapsed ? "10px" : "9px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? "var(--nav-active-bg)" : "transparent",
        color: active ? "var(--nav-active-color)" : "var(--nav-color)",
      }}
    >
      <span
        className="flex-shrink-0 transition-colors"
        style={{
          color: active ? "var(--nav-active-color)" : "var(--nav-icon-color)",
        }}
      >
        {icon}
      </span>

      {!collapsed && (
        <span className="whitespace-nowrap overflow-hidden leading-none">
          {label}
        </span>
      )}

      {active && !collapsed && (
        <span
          className="absolute right-2 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--nav-active-color)" }}
        />
      )}

      {collapsed && (
        <span className="sidebar-tooltip absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          {label}
        </span>
      )}
    </Link>
  );
}

function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const changeLanguage = (newLocale: string) => {
    const currentPath = pathname.replace(/^\/(vi|en|ja)/, "");
    router.push(`/${newLocale}${currentPath}`);
  };
  const { profile, hasPermission } = useAuth();
  const { NAV_ITEMS, BOTTOM_NAV } = useNavItems();

  const handleLogout = () => {
    localStorage.clear();
    router.push(`/${locale}`);
  };

  const visibleNav = NAV_ITEMS.filter(
    (item) =>
      item.feature === "PROFILE" || hasPermission(item.feature, "canView"),
  );

  const initials = profile
    ? (profile.fullname || profile.email).charAt(0).toUpperCase()
    : "?";

  const handleSidebarClick = () => {
    if (collapsed) setCollapsed(false);
  };

  return (
    <>
      <style>{`
        :root {
          --sidebar-bg: #ffffff;
          --sidebar-border: #ebebeb;
          --sidebar-width: 220px;
          --sidebar-collapsed-width: 64px;

          --nav-active-bg: #eff3ff;
          --nav-active-color: #4361ee;
          --nav-color: #52525b;
          --nav-icon-color: #a1a1aa;
          --nav-hover-bg: #f4f4f5;

          --logo-bg: #4361ee;
          --logo-color: #ffffff;

          --user-bg: #f4f4f5;
          --user-color: #4361ee;

          --tooltip-bg: #18181b;
          --tooltip-color: #ffffff;

          --divider: #f0f0f0;
          --text-primary: #18181b;
          --text-secondary: #a1a1aa;
          --text-muted: #d4d4d8;

          --logout-color: #f43f5e;
          --logout-hover: #fff1f3;

          --toggle-bg: #f4f4f5;
          --toggle-hover-bg: #e4e4e7;
          --toggle-color: #71717a;
        }

        .sidebar-root {
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .sidebar-nav-item:hover {
          background: var(--nav-hover-bg) !important;
        }
        .sidebar-nav-item[data-active="true"]:hover {
          background: var(--nav-active-bg) !important;
        }

        .sidebar-tooltip {
          background: var(--tooltip-bg);
          color: var(--tooltip-color);
        }

        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--toggle-bg);
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .sidebar-toggle:hover {
          background: var(--toggle-hover-bg);
        }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.15s;
          position: relative;
        }
        .sidebar-user-card:hover {
          background: var(--nav-hover-bg);
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 12px;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .sidebar-logout-btn:hover {
          background: var(--logout-hover);
        }

        .sidebar-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--nav-active-bg);
          color: var(--nav-active-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          border: 1.5px solid #dde4ff;
        }

        .sidebar-root.is-collapsed:hover {
          border-right-color: #dde4ff;
        }

        .sidebar-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0 10px;
          margin: 12px 0 4px;
        }

        .sidebar-divider {
          height: 1px;
          background: var(--divider);
          margin: 4px 0;
        }
      `}</style>

      <aside
        className={`sidebar-root${collapsed ? " is-collapsed" : ""}`}
        onClick={handleSidebarClick}
        style={{
          width: collapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
          cursor: collapsed ? "pointer" : "default",
        }}
      >
        {/* Header: Logo + Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "14px 14px 12px",
            borderBottom: "1px solid var(--divider)",
            minHeight: "56px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              overflow: "hidden",
              flex: collapsed ? "none" : "1",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                background: "var(--logo-bg)",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--logo-color)",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(67,97,238,0.25)",
              }}
            >
              IV
            </div>
            {!collapsed && (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                IVS Manager
              </span>
            )}
          </div>

          {!collapsed && (
            <button
              className="sidebar-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(true);
              }}
              title={t("collapse")}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--toggle-color)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "8px 10px",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {!collapsed && <p className="sidebar-section-label">{t("menu")}</p>}

          {visibleNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              collapsed={collapsed}
              onExpandRequest={() => setCollapsed(false)}
            />
          ))}

          <div className="sidebar-divider" style={{ margin: "10px 0" }} />

          {!collapsed && <p className="sidebar-section-label">{t("system")}</p>}

          {BOTTOM_NAV.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              collapsed={collapsed}
              onExpandRequest={() => setCollapsed(false)}
            />
          ))}
        </nav>

        {/* User + Logout */}
        <div
          style={{
            borderTop: "1px solid var(--divider)",
            padding: "10px 10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {profile && (
            <Link
              href={`/${locale}/dashboard/profile`}
              className="sidebar-user-card group"
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <div className="sidebar-avatar">{initials}</div>
              {!collapsed && (
                <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.3,
                    }}
                  >
                    {profile.fullname || profile.email}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.3,
                    }}
                  >
                    {profile.groups
                      .map((g: { name: string }) => g.name)
                      .join(", ")}
                  </p>
                </div>
              )}

              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  title={t("logout")}
                  style={{
                    marginLeft: "auto",
                    width: "26px",
                    height: "26px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--logout-color)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--logout-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-secondary)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                </button>
              )}

              {collapsed && (
                <span className="sidebar-tooltip absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {profile.fullname || profile.email}
                </span>
              )}
            </Link>
          )}
          {/* Language Switcher */}
          {/* Language Switcher */}
          <div
            style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid var(--divider)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {collapsed ? (
              <button
                onClick={() =>
                  changeLanguage(
                    locale === "vi" ? "en" : locale === "en" ? "ja" : "vi",
                  )
                }
                title="Change language"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#4361ee",
                }}
              >
                {locale.toUpperCase()}
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f4f4f5",
                  borderRadius: "10px",
                  padding: "3px",
                  gap: "2px",
                  width: "100%",
                }}
              >
                {[
                  { code: "vi", label: "VN" },
                  { code: "en", label: "EN" },
                  { code: "ja", label: "JP" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => changeLanguage(item.code)}
                    style={{
                      flex: 1,
                      height: "28px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 600,
                      transition: "all .2s ease",
                      background:
                        locale === item.code ? "#ffffff" : "transparent",
                      color: locale === item.code ? "#4361ee" : "#71717a",
                      boxShadow:
                        locale === item.code
                          ? "0 1px 3px rgba(0,0,0,.08)"
                          : "none",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {collapsed && (
            <button
              className="sidebar-logout-btn group"
              onClick={handleLogout}
              style={{ justifyContent: "center" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--logout-color)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span className="sidebar-tooltip absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {t("logout")}
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// Header hiển thị tên trang đang active
function DashboardHeader() {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const locale = useLocale();

  const allNav = [
    { href: `/${locale}/dashboard/user`, label: t("user") },
    { href: `/${locale}/dashboard/group`, label: t("group") },
    { href: `/${locale}/dashboard/permission`, label: t("permission") },
    { href: `/${locale}/dashboard/profile`, label: t("profile") },
    { href: `/${locale}/dashboard/settings`, label: t("settings") },
    { href: `/${locale}/dashboard/notifications`, label: t("notifications") },
  ];

  const activeItem = allNav.find((item) => pathname === item.href);

  if (!activeItem) return null;

  return (
    <div
      style={{
        padding: "14px 24px",
        borderBottom: "1px solid #ebebeb",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#4361ee",
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <h1
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#18181b",
          margin: 0,
        }}
      >
        {activeItem.label}
      </h1>
    </div>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const { loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push(`/${locale}`);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f9f8",
        }}
      >
        <div style={{ fontSize: "13px", color: "#aaa" }}>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f5f4f0",
      }}
    >
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex: 1, overflowY: "auto", background: "#f5f4f0" }}>
       
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
