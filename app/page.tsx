"use client";

import Link from "next/link";

const sections = [
  {
    title: "العملاء",
    icon: "👥",
    description: "إدارة العملاء وبيانات التواصل",
    link: "/customers",
  },
  {
    title: "المواقع",
    icon: "📍",
    description: "مواقع العملاء وعناوينها",
    link: "/sites",
  },
  {
    title: "أجهزة UPS",
    icon: "⚡",
    description: "إدارة أجهزة UPS والموديلات والسيريال",
    link: "/ups-page",
  },
  {
    title: "الصيانة",
    icon: "🔧",
    description: "تسجيل ومتابعة أوامر الصيانة",
    link: "/maintenance",
  },
  {
    title: "المخزن",
    icon: "📦",
    description: "قطع الغيار وحركات المخزون",
    link: "/warehouse",
  },
  {
    title: "البطاريات",
    icon: "🔋",
    description: "إدارة البطاريات ومتابعة حالتها",
    link: "/warehouse",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        direction: "rtl",
        fontFamily: "Arial",
        padding: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: "1100px",
          margin: "0 auto 25px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "22px 25px",
          boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            ⚡ Power Master
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#666",
            }}
          >
            نظام إدارة الصيانة والمخزن وأجهزة UPS
          </p>
        </div>

        <div
          style={{
            background: "#eef6ff",
            padding: "10px 15px",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          لوحة التحكم
        </div>
      </header>

      {/* Quick Maintenance */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto 25px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>🔧 صيانة جديدة</h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#666",
              }}
            >
              ابدأ أمر صيانة جديد واختر العميل والموقع وجهاز UPS.
            </p>
          </div>

          <Link
            href="/maintenance"
            style={{
              background: "#16a34a",
              color: "white",
              textDecoration: "none",
              padding: "13px 25px",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            + تسجيل صيانة
          </Link>
        </div>
      </section>

      {/* Sections */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "18px",
        }}
      >
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.link}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "25px",
                minHeight: "150px",
                boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
                transition: "0.2s",
                cursor: "pointer",
              }}>
              <div
                style={{
                  fontSize: "38px",
                  marginBottom: "15px",
                }}
              >
                {section.icon}
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "20px",
                }}
              >
                {section.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: "1100px",
          margin: "35px auto 0",
          textAlign: "center",
          color: "#888",
          fontSize: "13px",
        }}
      >
        Power Master Management System
      </footer>
    </main>
  );
}