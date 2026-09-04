"use client";
import { useEffect, useState } from "react";
type Site = { id: number; name: string; address: string; phone: string; };
type Customer = { id: number; name: string; phone: string; notes: string; sites: Site[]; };
export default function CustomersPage() { const [customers, setCustomers] = useState<Customer[]>([]); const [loading, setLoading] = useState(true);
const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [siteName, setSiteName] = useState(""); const [notes, setNotes] = useState("");
const [editingId, setEditingId] = useState<number | null>(null); const [search, setSearch] = useState("");
async function loadCustomers() { try { setLoading(true);
  const response = await fetch("/api/customers");
  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "حدث خطأ أثناء جلب العملاء");
    return;
  }

  setCustomers(data);
} catch (error) {
  console.error(error);
  alert("تعذر الاتصال بالسيرفر");
} finally {
  setLoading(false);
}
}
useEffect(() => { loadCustomers(); }, []);
function resetForm() { setName(""); setPhone(""); setSiteName(""); setNotes(""); setEditingId(null); }
async function handleSubmit(e: React.FormEvent) { e.preventDefault();
if (!name.trim()) {
  alert("اكتب اسم العميل");
  return;
}

try {
  const response = await fetch("/api/customers", {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      editingId
        ? {
            id: editingId,
            name,
            phone,
            notes,
          }
        : {
            name,
            phone,
            siteName,
            notes,
          }
    ),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "حدث خطأ");
    return;
  }

  alert(
    editingId
      ? "تم تعديل العميل بنجاح"
      : "تم تسجيل العميل والموقع بنجاح"
  );

  resetForm();
  loadCustomers();
} catch (error) {
  console.error(error);
  alert("تعذر الاتصال بالسيرفر");
}
}
function handleEdit(customer: Customer) { setEditingId(customer.id); setName(customer.name); setPhone(customer.phone); setNotes(customer.notes);
if (customer.sites.length > 0) {
  setSiteName(customer.sites[0].name);
} else {
  setSiteName("");
}

window.scrollTo({
  top: 0,
  behavior: "smooth",
});
}
async function handleDelete(id: number) { const confirmed = confirm( "هل أنت متأكد من حذف هذا العميل؟" );
if (!confirmed) return;

try {
  const response = await fetch("/api/customers", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "لا يمكن حذف العميل");
    return;
  }

  alert("تم حذف العميل");
  loadCustomers();
} catch (error) {
  console.error(error);
  alert("تعذر الاتصال بالسيرفر");
}
}
const filteredCustomers = customers.filter((customer) => { const text = search.toLowerCase();
return (
  customer.name.toLowerCase().includes(text) ||
  customer.phone.toLowerCase().includes(text) ||
  customer.sites.some((site) =>
    site.name.toLowerCase().includes(text)
  )
);
});
return ( <main dir="rtl" style={{ minHeight: "100vh", padding: "30px", background: "#f5f7fa", fontFamily: "Arial, sans-serif", }} > <div style={{ maxWidth: "1200px", margin: "0 auto", }} > <h1 style={{ marginBottom: "25px", fontSize: "30px", }} > إدارة العملاء </h1>
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "16px",
        marginBottom: "30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        {editingId ? "تعديل العميل" : "إضافة عميل جديد"}
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
          <label>اسم العميل</label>

          <input
            value={name}onChange={(e) => setName(e.target.value)}
            placeholder="اسم العميل"
            style={inputStyle}
          />
        </div>

        <div>
          <label>رقم الهاتف</label>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="رقم الهاتف"
            style={inputStyle}
          />
        </div>

        <div>
          <label>الموقع</label>

          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="اسم الموقع / الفرع"
            style={inputStyle}
          />
        </div>

        <div>
          <label>ملاحظات</label>

          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات"
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button type="submit" style={buttonStyle}>
          {editingId
            ? "حفظ التعديل"
            : "تسجيل العميل"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              ...buttonStyle,
              background: "#777",
            }}
          >
            إلغاء
          </button>
        )}
      </div>
    </form>

    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <h2>العملاء المسجلين</h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم العميل أو الموقع..."
          style={{
            ...inputStyle,
            maxWidth: "300px",
          }}
        />
      </div>

      {loading ? (
        <p>جاري تحميل العملاء...</p>
      ) : filteredCustomers.length === 0 ? (
        <p>لا يوجد عملاء مسجلون</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>اسم العميل</th>
                <th style={thStyle}>رقم الهاتف</th>
                <th style={thStyle}>الموقع</th>
                <th style={thStyle}>ملاحظات</th>
                <th style={thStyle}>الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={tdStyle}>
                    {customer.name}
                  </td>

                  <td style={tdStyle}>
                    {customer.phone || "-"}
                  </td>

                  <td style={tdStyle}>
                    {customer.sites.length > 0
                      ? customer.sites
                          .map((site) => site.name)
                          .join("، ")
                      : "-"}
                  </td>

                  <td style={tdStyle}>
                    {customer.notes || "-"}
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(customer)
                        }
                        style={{
                          ...smallButtonStyle,
                          background: "#2563eb",}}
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(customer.id)
                        }
                        style={{
                          ...smallButtonStyle,
                          background: "#dc2626",
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
</main>
); }
const inputStyle = { width: "100%", padding: "12px", marginTop: "7px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" as const, };
const buttonStyle = { border: "none", background: "#2563eb", color: "white", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", };
const smallButtonStyle = { border: "none", color: "white", padding: "8px 12px", borderRadius: "7px", cursor: "pointer", fontSize: "13px", };
const thStyle = { padding: "12px", borderBottom: "2px solid #e5e7eb", textAlign: "right" as const, whiteSpace: "nowrap" as const, };
const tdStyle = { padding: "12px", borderBottom: "1px solid #e5e7eb", verticalAlign: "top" as const, };