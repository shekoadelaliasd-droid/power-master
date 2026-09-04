"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone?: string;
  notes?: string;
};

type Site = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  customerId: number;
};

type UPS = {
  id: number;
  type: string;
  model: string;
  serial: string;
  power: string;
  customerId?: number | null;
  siteId?: number | null;
};

export default function MaintenancePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [upsList, setUpsList] = useState<UPS[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [upsId, setUpsId] = useState("");

  const [loading, setLoading] = useState(true);

  // =========================
  // بيانات الصيانة
  // =========================
  const [maintenanceType, setMaintenanceType] = useState("");
  const [maintenanceStatus, setMaintenanceStatus] = useState("");
  const [fault, setFault] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // =========================
  // إضافة عميل
  // =========================
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // =========================
  // إضافة موقع
  // =========================
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [sitePhone, setSitePhone] = useState("");

  // =========================
  // إضافة UPS
  // =========================
  const [showUpsForm, setShowUpsForm] = useState(false);
  const [upsType, setUpsType] = useState("");
  const [upsModel, setUpsModel] = useState("");
  const [upsSerial, setUpsSerial] = useState("");
  const [upsPower, setUpsPower] = useState("");

  // =========================
  // تحميل البيانات
  // =========================
  async function loadData() {
    try {
      setLoading(true);

      const customersRes = await fetch("/api/customers");
      const sitesRes = await fetch("/api/sites");
      const upsRes = await fetch("/api/ups");

      const customersData = await customersRes.json();
      const sitesData = await sitesRes.json();
      const upsData = await upsRes.json();

      if (!customersRes.ok) {
        throw new Error("فشل تحميل العملاء");
      }

      if (!sitesRes.ok) {
        throw new Error("فشل تحميل المواقع");
      }

      if (!upsRes.ok) {
        throw new Error("فشل تحميل أجهزة UPS");
      }

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setSites(Array.isArray(sitesData) ? sitesData : []);
      setUpsList(Array.isArray(upsData) ? upsData : []);
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);
      alert("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // المواقع الخاصة بالعميل
  // =========================
  const filteredSites = sites.filter(
    (site) => site.customerId === Number(customerId)
  );

  // =========================
  // UPS الخاص بالموقع
  // =========================
  const filteredUps = upsList.filter(
    (ups) => ups.siteId === Number(siteId)
  );

  // =========================
  // تغيير العميل
  // =========================
  function handleCustomerChange(value: string) {
    setCustomerId(value);
    setSiteId("");
    setUpsId("");

    setShowSiteForm(false);
    setShowUpsForm(false);
  }

  // =========================
  // تغيير الموقع
  // =========================
  function handleSiteChange(value: string) {
    setSiteId(value);
    setUpsId("");

    setShowUpsForm(false);
  }

  // =========================
  // إضافة عميل// =========================
  async function addCustomer() {
    if (!customerName.trim()) {
      alert("اكتب اسم العميل");
      return;
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          notes: customerNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "حدث خطأ أثناء إضافة العميل");
        return;
      }

      setCustomers((previous) => [data, ...previous]);

      setCustomerId(String(data.id));

      setCustomerName("");
      setCustomerPhone("");
      setCustomerNotes("");

      setShowCustomerForm(false);

      alert("تم إضافة العميل بنجاح");
    } catch (error) {
      console.error("ADD CUSTOMER ERROR:", error);
      alert("حدث خطأ أثناء إضافة العميل");
    }
  }

  // =========================
  // إضافة موقع
  // =========================
  async function addSite() {
    if (!customerId) {
      alert("اختر العميل أولاً");
      return;
    }

    if (!siteName.trim()) {
      alert("اكتب اسم الموقع");
      return;
    }

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: siteName,
          address: siteAddress,
          phone: sitePhone,
          customerId: Number(customerId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "حدث خطأ أثناء إضافة الموقع");
        return;
      }

      setSites((previous) => [data, ...previous]);

      setSiteId(String(data.id));

      setSiteName("");
      setSiteAddress("");
      setSitePhone("");

      setShowSiteForm(false);

      alert("تم إضافة الموقع بنجاح");
    } catch (error) {
      console.error("ADD SITE ERROR:", error);
      alert("حدث خطأ أثناء إضافة الموقع");
    }
  }

  // =========================
  // إضافة UPS
  // =========================
  async function addUPS() {
    if (!customerId) {
      alert("اختر العميل أولاً");
      return;
    }

    if (!siteId) {
      alert("اختر الموقع أولاً");
      return;
    }

    if (!upsType.trim()) {
      alert("اكتب نوع UPS");
      return;
    }

    if (!upsModel.trim()) {
      alert("اكتب موديل UPS");
      return;
    }

    if (!upsSerial.trim()) {
      alert("اكتب Serial Number");
      return;
    }

    if (!upsPower.trim()) {
      alert("اكتب قدرة UPS");
      return;
    }

    try {
      const response = await fetch("/api/ups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: upsType,
          model: upsModel,
          serial: upsSerial,
          power: upsPower,
          customerId: Number(customerId),
          siteId: Number(siteId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "حدث خطأ أثناء إضافة UPS");
        return;
      }

      setUpsList((previous) => [data, ...previous]);

      setUpsId(String(data.id));

      setUpsType("");
      setUpsModel("");
      setUpsSerial("");
      setUpsPower("");

      setShowUpsForm(false);

      alert("تم إضافة جهاز UPS بنجاح");
    } catch (error) {
      console.error("ADD UPS ERROR:", error);
      alert("حدث خطأ أثناء إضافة UPS");
    }
  }

  // =========================
  // حفظ أمر الصيانة
  // =========================
  async function saveMaintenance() {
    if (!customerId) {
      alert("اختر العميل أولاً");
      return;
    }

    if (!siteId) {
      alert("اختر الموقع أولاً");
      return;
    }

    if (!upsId) {
      alert("اختر جهاز UPS أولاً");
      return;
    }

    if (!maintenanceType) {
      alert("اختر نوع الصيانة");
      return;
    }

    if (!maintenanceStatus) {alert("اختر حالة الصيانة");
      return;
    }

    try {
      setSavingMaintenance(true);

      const orderNumber = `MO-${Date.now()}`;

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNumber,
          customerId: Number(customerId),
          siteId: Number(siteId),
          upsId: Number(upsId),
          status: maintenanceStatus,
          faultType: maintenanceType,
          faultCode: "",
          diagnosis: fault,
          actionTaken: "",
          notes: technicianNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "حدث خطأ أثناء حفظ أمر الصيانة");
        return;
      }

      alert(
        "تم حفظ أمر الصيانة بنجاح\nرقم الأمر: " +
          data.orderNumber
      );

      setMaintenanceType("");
      setMaintenanceStatus("");
      setFault("");
      setTechnicianNotes("");
    } catch (error) {
      console.error("SAVE MAINTENANCE ERROR:", error);
      alert("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setSavingMaintenance(false);
    }
  }

  // =========================
  // شاشة التحميل
  // =========================
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "30px",
          direction: "rtl",
          fontFamily: "Arial",
        }}
      >
        <h2>جاري تحميل البيانات...</h2>
      </main>
    );
  }

  // =========================
  // الصفحة
  // =========================
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
        padding: "30px 15px",
        direction: "rtl",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "30px",
          }}
        >
          🔧 تسجيل صيانة جديدة
        </h1>

        {/* =========================
            العميل
        ========================= */}
        <section style={{ marginBottom: "25px" }}>
          <label style={labelStyle}>العميل</label>

          <div style={rowStyle}>
            <select
              value={customerId}
              onChange={(event) =>
                handleCustomerChange(event.target.value)
              }
              style={inputStyle}
            >
              <option value="">اختر العميل</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                setShowCustomerForm(!showCustomerForm)
              }
              style={blueButtonStyle}
            >
              + إضافة عميل
            </button>
          </div>

          {showCustomerForm && (
            <div style={formBoxStyle}>
              <h3>إضافة عميل جديد</h3>

              <input
                type="text"
                placeholder="اسم العميل"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="رقم الهاتف"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(event.target.value)
                }
                style={inputStyle}
              />

              <textarea
                placeholder="ملاحظات"
                value={customerNotes}
                onChange={(event) =>setCustomerNotes(event.target.value)
                }
                style={textareaStyle}
              />

              <button
                type="button"
                onClick={addCustomer}
                style={greenButtonStyle}
              >
                حفظ العميل
              </button>
            </div>
          )}
        </section>

        {/* =========================
            الموقع
        ========================= */}
        <section style={{ marginBottom: "25px" }}>
          <label style={labelStyle}>الموقع</label>

          <div style={rowStyle}>
            <select
              value={siteId}
              onChange={(event) =>
                handleSiteChange(event.target.value)
              }
              disabled={!customerId}
              style={{
                ...inputStyle,
                opacity: customerId ? 1 : 0.6,
              }}
            >
              <option value="">
                {!customerId
                  ? "اختر العميل أولاً"
                  : filteredSites.length === 0
                  ? "لا يوجد موقع - أضف موقع"
                  : "اختر الموقع"}
              </option>

              {filteredSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!customerId}
              onClick={() =>
                setShowSiteForm(!showSiteForm)
              }
              style={{
                ...blueButtonStyle,
                opacity: customerId ? 1 : 0.5,
              }}
            >
              + إضافة موقع
            </button>
          </div>

          {showSiteForm && customerId && (
            <div style={formBoxStyle}>
              <h3>إضافة موقع جديد</h3>

              <input
                type="text"
                placeholder="اسم الموقع"
                value={siteName}
                onChange={(event) =>
                  setSiteName(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="العنوان"
                value={siteAddress}
                onChange={(event) =>
                  setSiteAddress(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="هاتف الموقع"
                value={sitePhone}
                onChange={(event) =>
                  setSitePhone(event.target.value)
                }
                style={inputStyle}
              />

              <button
                type="button"
                onClick={addSite}
                style={greenButtonStyle}
              >
                حفظ الموقع
              </button>
            </div>
          )}
        </section>

        {/* =========================
            UPS
        ========================= */}
        <section style={{ marginBottom: "25px" }}>
          <label style={labelStyle}>جهاز UPS</label>

          <div style={rowStyle}>
            <select
              value={upsId}
              onChange={(event) =>
                setUpsId(event.target.value)
              }
              disabled={!siteId}
              style={{
                ...inputStyle,
                opacity: siteId ? 1 : 0.6,
              }}
            >
              <option value="">
                {!siteId
                  ? "اختر الموقع أولاً"
                  : filteredUps.length === 0
                  ? "لا يوجد UPS - أضف جهاز"
                  : "اختر جهاز UPS"}
              </option>

              {filteredUps.map((ups) => (
                <option key={ups.id} value={ups.id}>
                  {ups.model} - {ups.serial}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!siteId}
              onClick={() =>setShowUpsForm(!showUpsForm)
              }
              style={{
                ...blueButtonStyle,
                opacity: siteId ? 1 : 0.5,
              }}
            >
              + إضافة UPS
            </button>
          </div>

          {showUpsForm && siteId && (
            <div style={formBoxStyle}>
              <h3>إضافة جهاز UPS جديد</h3>

              <input
                type="text"
                placeholder="النوع"
                value={upsType}
                onChange={(event) =>
                  setUpsType(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="الموديل"
                value={upsModel}
                onChange={(event) =>
                  setUpsModel(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Serial Number"
                value={upsSerial}
                onChange={(event) =>
                  setUpsSerial(event.target.value)
                }
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Power"
                value={upsPower}
                onChange={(event) =>
                  setUpsPower(event.target.value)
                }
                style={inputStyle}
              />

              <button
                type="button"
                onClick={addUPS}
                style={greenButtonStyle}
              >
                حفظ UPS
              </button>
            </div>
          )}
        </section>

        <hr
          style={{
            margin: "30px 0",
            border: 0,
            borderTop: "1px solid #ddd",
          }}
        />

        {/* =========================
            بيانات الصيانة
        ========================= */}
        <h2>بيانات الصيانة</h2>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>نوع الصيانة</label>

            <select
              style={inputStyle}
              value={maintenanceType}
              onChange={(event) =>
                setMaintenanceType(event.target.value)
              }
            >
              <option value="">اختر النوع</option>
              <option value="دورية">صيانة دورية</option>
              <option value="طارئة">صيانة طارئة</option>
              <option value="تركيب">تركيب</option>
              <option value="فحص">فحص</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>حالة الصيانة</label>

            <select
              style={inputStyle}
              value={maintenanceStatus}
              onChange={(event) =>
                setMaintenanceStatus(event.target.value)
              }
            >
              <option value="">اختر الحالة</option>
              <option value="مفتوحة">مفتوحة</option>
              <option value="جاري العمل">جاري العمل</option>
              <option value="تم الإصلاح">تم الإصلاح</option>
              <option value="مغلقة">مغلقة</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <label style={labelStyle}>العطل / المشكلة</label>

          <textarea
            placeholder="اكتب وصف العطل..."
            value={fault}
            onChange={(event) =>
              setFault(event.target.value)
            }
            style={textareaLargeStyle}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <label style={labelStyle}>ملاحظات الفني</label>

          <textarea
            placeholder="اكتب ملاحظاتك..."
            value={technicianNotes}
            onChange={(event) =>
              setTechnicianNotes(event.target.value)
            }
            style={textareaLargeStyle}
          />
        </div>

        <button
          type="button"
          disabled={savingMaintenance}
          style={{...greenButtonStyle,
            width: "100%",
            marginTop: "30px",
            fontSize: "18px",
            opacity: savingMaintenance ? 0.6 : 1,
          }}
          onClick={saveMaintenance}
        >
          {savingMaintenance
            ? "جاري الحفظ..."
            : "💾 حفظ أمر الصيانة"}
        </button>
      </div>
    </main>
  );
}

// =========================
// Styles
// =========================

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "5px",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box",
  marginTop: "8px",
  background: "#fff",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "80px",
  resize: "vertical",
};

const textareaLargeStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
};

const blueButtonStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
  padding: "11px 15px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  marginTop: "8px",
};

const greenButtonStyle: React.CSSProperties = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
};

const formBoxStyle: React.CSSProperties = {
  marginTop: "15px",
  padding: "20px",
  background: "#f8fafc",
  border: "1px solid #ddd",
  borderRadius: "10px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginTop: "15px",
};