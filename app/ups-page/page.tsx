"use client";

import { useEffect, useState } from "react";

type Site = {
  id: number;
  name: string;
  customerId: number;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  sites: Site[];
};

type UPS = {
  id: number;
  type: string;
  model: string;
  serial: string;
  power: string;
  customerId: number | null;
  siteId: number | null;
  customer: Customer | null;
  site: Site | null;
};

type UPSModel = {
  id: number;
  name: string;
};

export default function UPSPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [upsList, setUpsList] = useState<UPS[]>([]);
  const [models, setModels] = useState<UPSModel[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [type, setType] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [power, setPower] = useState("");

  const [search, setSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [showModels, setShowModels] = useState(false);

  const [loading, setLoading] = useState(true);

  // رقم الجهاز الذي يتم تعديله
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);

      const [
        customersResponse,
        upsResponse,
        modelsResponse,
      ] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/ups"),
        fetch("/api/ups-models"),
      ]);

      const customersData = await customersResponse.json();
      const upsData = await upsResponse.json();
      const modelsData = await modelsResponse.json();

      if (!customersResponse.ok) {
        alert(
          customersData.error ||
            "حدث خطأ أثناء جلب العملاء"
        );
        return;
      }

      if (!upsResponse.ok) {
        alert(
          upsData.error ||
            "حدث خطأ أثناء جلب أجهزة UPS"
        );
        return;
      }

      if (!modelsResponse.ok) {
        alert(
          modelsData.error ||
            "حدث خطأ أثناء جلب موديلات UPS"
        );
        return;
      }

      setCustomers(customersData);
      setUpsList(upsData);
      setModels(modelsData);
    } catch (error) {
      console.error(error);
      alert("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedCustomer = customers.find(
    (customer) =>
      customer.id === Number(customerId)
  );

  const availableSites =
    selectedCustomer?.sites || [];

  const filteredModels = models.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(modelSearch.toLowerCase())
  );

  function resetForm() {
    setCustomerId("");
    setSiteId("");
    setType("");
    setModel("");
    setSerial("");
    setPower("");
    setModelSearch("");
    setShowModels(false);
    setEditingId(null);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!customerId) {
      alert("اختار العميل");
      return;
    }

    if (!siteId) {
      alert("اختار الموقع");
      return;
    }

    if (!type) {
      alert("اختار نوع الجهاز");
      return;
    }

    if (!model.trim()) {
      alert("اكتب موديل الجهاز");
      return;
    }

    if (!serial.trim()) {
      alert("اكتب السيريال");
      return;
    }

    if (!power) {
      alert("اختار قدرة الجهاز");
      return;
    }

    try {
      const isEditing = editingId !== null;

      const response = await fetch("/api/ups", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEditing
            ? { id: editingId }
            : {}),
          type,
          model: model.trim(),
          serial: serial.trim(),
          power,
          customerId: Number(customerId),
          siteId: Number(siteId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {alert(
          data.error ||
            (
              isEditing
                ? "حدث خطأ أثناء تعديل الجهاز"
                : "حدث خطأ أثناء تسجيل الجهاز"
            )
        );
        return;
      }

      alert(
        isEditing
          ? "تم تعديل جهاز UPS بنجاح"
          : "تم تسجيل جهاز UPS بنجاح"
      );

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("تعذر الاتصال بالسيرفر");
    }
  }

  function handleEdit(ups: UPS) {
    setEditingId(ups.id);

    setCustomerId(
      ups.customerId
        ? String(ups.customerId)
        : ""
    );

    setSiteId(
      ups.siteId
        ? String(ups.siteId)
        : ""
    );

    setType(ups.type);
    setModel(ups.model);
    setSerial(ups.serial);
    setPower(ups.power);

    setModelSearch(ups.model);
    setShowModels(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "هل أنت متأكد من حذف جهاز UPS هذا؟"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/ups", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "حدث خطأ أثناء حذف الجهاز"
        );
        return;
      }

      alert("تم حذف الجهاز");

      loadData();
    } catch (error) {
      console.error(error);
      alert("تعذر الاتصال بالسيرفر");
    }
  }

  const filteredUPS = upsList.filter((ups) => {
    const text = search.toLowerCase();

    return (
      ups.serial
        .toLowerCase()
        .includes(text) ||
      ups.model
        .toLowerCase()
        .includes(text) ||
      ups.type
        .toLowerCase()
        .includes(text) ||
      ups.power
        .toLowerCase()
        .includes(text) ||
      ups.customer?.name
        .toLowerCase()
        .includes(text) ||
      ups.site?.name
        .toLowerCase()
        .includes(text)
    );
  });

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f5f7fa",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            marginBottom: "25px",
          }}
        >
          أجهزة UPS
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "30px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            {editingId !== null
              ? "تعديل جهاز UPS"
              : "تسجيل جهاز UPS"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label>العميل</label>

              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(
                    e.target.value
                  );
                  setSiteId("");
                }}
                style={inputStyle}
              >
                <option value="">
                  اختار العميل
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  )
                )}
              </select></div>

            <div>
              <label>الموقع</label>

              <select
                value={siteId}
                onChange={(e) =>
                  setSiteId(
                    e.target.value
                  )
                }
                disabled={!customerId}
                style={{
                  ...inputStyle,
                  background: customerId
                    ? "white"
                    : "#eee",
                }}
              >
                <option value="">
                  {customerId
                    ? "اختار الموقع"
                    : "اختار العميل أولًا"}
                </option>

                {availableSites.map(
                  (site) => (
                    <option
                      key={site.id}
                      value={site.id}
                    >
                      {site.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label>نوع الجهاز</label>

              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  اختار النوع
                </option>

                <option value="Online">
                  Online
                </option>

                <option value="Line Interactive">
                  Line Interactive
                </option>

                <option value="Offline">
                  Offline
                </option>
              </select>
            </div>

            <div
              style={{
                position: "relative",
              }}
            >
              <label>
                موديل الجهاز
              </label>

              <div
                style={{
                  position: "relative",
                  marginTop: "7px",
                }}
              >
                <input
                  value={model}
                  onChange={(e) => {
                    setModel(
                      e.target.value
                    );
                    setModelSearch(
                      e.target.value
                    );
                    setShowModels(true);
                  }}
                  onFocus={() => {
                    setModelSearch(
                      model
                    );
                    setShowModels(true);
                  }}
                  placeholder="اكتب أو اختار الموديل"
                  style={{
                    ...inputStyle,
                    marginTop: "0",
                    paddingLeft: "40px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setModelSearch(model);
                    setShowModels(
                      !showModels
                    );
                  }}
                  style={{
                    position:
                      "absolute",
                    left: "8px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    border: "none",
                    background:
                      "transparent",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ▼
                </button>
              </div>

              {showModels && (
                <div
                  style={{
                    position:
                      "absolute",
                    top: "75px",
                    right: "0",
                    left: "0",
                    background:
                      "white",
                    border:
                      "1px solid #d1d5db",
                    borderRadius:
                      "8px",
                    maxHeight: "220px",overflowY:
                      "auto",
                    zIndex: 20,
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.12)",
                  }}
                >
                  <input
                    value={
                      modelSearch
                    }
                    onChange={(e) =>
                      setModelSearch(
                        e.target.value
                      )
                    }
                    placeholder="ابحث عن موديل..."
                    style={{
                      width: "100%",
                      padding:
                        "10px",
                      border: "none",
                      borderBottom:
                        "1px solid #e5e7eb",
                      outline: "none",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  {filteredModels.length ===
                  0 ? (
                    <div
                      style={{
                        padding:
                          "12px",
                        color:
                          "#666",
                      }}
                    >
                      لا يوجد موديل
                      مسجل
                    </div>
                  ) : (
                    filteredModels.map(
                      (item) => (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          onClick={() => {
                            setModel(
                              item.name
                            );
                            setModelSearch(
                              item.name
                            );
                            setShowModels(
                              false
                            );
                          }}
                          style={{
                            display:
                              "block",
                            width:
                              "100%",
                            padding:
                              "11px",
                            textAlign:
                              "right",
                            border:
                              "none",
                            borderBottom:
                              "1px solid #f1f1f1",
                            background:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          {
                            item.name
                          }
                        </button>
                      )
                    )
                  )}
                </div>
              )}

              <small
                style={{
                  display:
                    "block",
                  marginTop: "6px",
                  color: "#666",
                }}
              >
                الموديل الجديد بيتسجل
                تلقائيًا
              </small>
            </div>

            <div>
              <label>السيريال</label>

              <input
                value={serial}
                onChange={(e) =>
                  setSerial(
                    e.target.value
                  )
                }
                placeholder="Serial Number"
                style={inputStyle}
              />
            </div>

            <div>
              <label>القدرة</label>

              <select
                value={power}
                onChange={(e) =>
                  setPower(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  اختار القدرة
                </option>

                <option value="1 KVA">
                  1 KVA</option>

                <option value="2 KVA">
                  2 KVA
                </option>

                <option value="3 KVA">
                  3 KVA
                </option>

                <option value="5 KVA">
                  5 KVA
                </option>

                <option value="6 KVA">
                  6 KVA
                </option>

                <option value="10 KVA">
                  10 KVA
                </option>

                <option value="20 KVA">
                  20 KVA
                </option>

                <option value="30 KVA">
                  30 KVA
                </option>

                <option value="40 KVA">
                  40 KVA
                </option>

                <option value="60 KVA">
                  60 KVA
                </option>

                <option value="80 KVA">
                  80 KVA
                </option>

                <option value="100 KVA">
                  100 KVA
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              style={{
                ...buttonStyle,
                flex: 1,
              }}
            >
              {editingId !== null
                ? "💾 حفظ التعديل"
                : "تسجيل جهاز UPS"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  ...buttonStyle,
                  background:
                    "#6b7280",
                }}
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        <section
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <h2>
              الأجهزة المسجلة
            </h2>

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="ابحث بالعميل أو الموقع أو السيريال..."
              style={{
                ...inputStyle,
                maxWidth: "350px",
              }}
            />
          </div>

          {loading ? (
            <p>
              جاري تحميل الأجهزة...
            </p>
          ) : filteredUPS.length ===
            0 ? (
            <p>
              لا توجد أجهزة UPS
              مسجلة
            </p>
          ) : (
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1000px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      العميل
                    </th>

                    <th style={thStyle}>
                      الموقع
                    </th>

                    <th style={thStyle}>
                      النوع
                    </th>

                    <th style={thStyle}>
                      الموديل
                    </th>

                    <th style={thStyle}>
                      السيريال
                    </th>

                    <th style={thStyle}>
                      القدرة</th>

                    <th style={thStyle}>
                      الإجراء
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUPS.map(
                    (ups) => (
                      <tr
                        key={ups.id}
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {ups.customer
                            ?.name ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {ups.site
                            ?.name ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {ups.type}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {ups.model}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {ups.serial}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {ups.power}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  ups
                                )
                              }
                              style={{
                                ...smallButtonStyle,
                                background:
                                  "#2563eb",
                              }}
                            >
                              تعديل
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  ups.id
                                )
                              }
                              style={{
                                ...smallButtonStyle,
                                background:
                                  "#dc2626",
                              }}
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "7px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing:
    "border-box" as const,
};

const buttonStyle = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px",
};

const smallButtonStyle = {
  border: "none",color: "white",
  padding: "8px 12px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "13px",
};

const thStyle = {
  padding: "12px",
  borderBottom:
    "2px solid #e5e7eb",
  textAlign:
    "right" as const,
  whiteSpace:
    "nowrap" as const,
};

const tdStyle = {
  padding: "12px",
  borderBottom:
    "1px solid #e5e7eb",
  verticalAlign:
    "top" as const,
};