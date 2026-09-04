"use client";
import { useEffect, useState } from "react";
type Customer = { id: number; name: string; phone: string; notes: string; };
type Site = { id: number; name: string; address: string; phone: string; customerId: number; customer: Customer; ups: { id: number; }[]; };
export default function SitesPage() { const [sites, setSites] = useState<Site[]>([]); const [customers, setCustomers] = useState<Customer[]>([]);
const [customerId, setCustomerId] = useState(""); const [name, setName] = useState(""); const [address, setAddress] = useState(""); const [phone, setPhone] = useState("");
const [search, setSearch] = useState("");
const [editingSite, setEditingSite] = useState<Site | null>(null);
const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
const loadData = async () => { try { setLoading(true);
  const [sitesResponse, customersResponse] = await Promise.all([
    fetch("/api/sites", {
      cache: "no-store",
    }),
    fetch("/api/customers", {
      cache: "no-store",
    }),
  ]);

  if (!sitesResponse.ok || !customersResponse.ok) {
    throw new Error("فشل تحميل البيانات");
  }

  const sitesData = await sitesResponse.json();
  const customersData = await customersResponse.json();

  setSites(Array.isArray(sitesData) ? sitesData : []);
  setCustomers(
    Array.isArray(customersData) ? customersData : []
  );
} catch (error) {
  console.error("LOAD DATA ERROR:", error);
  alert("حدث خطأ أثناء تحميل البيانات");
} finally {
  setLoading(false);
}
};
useEffect(() => { loadData(); }, []);
const selectedCustomer = customers.find( (customer) => customer.id === Number(customerId) );
const customerSites = sites.filter( (site) => site.customerId === Number(customerId) );
const handleCustomerChange = ( value: string ) => { setCustomerId(value);
const customer = customers.find(
  (item) => item.id === Number(value)
);

if (!customer) {
  setPhone("");
  return;
}

setPhone(customer.phone || "");

if (!editingSite) {
  setName("");
  setAddress("");
}
};
const resetForm = () => { setCustomerId(""); setName(""); setAddress(""); setPhone(""); setEditingSite(null); };
const saveSite = async () => { if (!customerId) { alert("اختار العميل"); return; }
if (!name.trim()) {
  alert("اكتب اسم الموقع أو الفرع");
  return;
}

try {
  setSaving(true);

  const method = editingSite ? "PUT" : "POST";

  const response = await fetch("/api/sites", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: editingSite?.id,
      customerId: Number(customerId),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(
      data?.error ||
        "حدث خطأ أثناء حفظ الموقع"
    );
    return;
  }

  resetForm();
  await loadData();
} catch (error) {
  console.error("SAVE SITE ERROR:", error);
  alert("حدث خطأ في الاتصال بالخادم");
} finally {
  setSaving(false);
}
};
const editSite = (site: Site) => { setEditingSite(site);
setCustomerId(String(site.customerId));
setName(site.name);
setAddress(site.address);
setPhone(site.phone);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});
};
const deleteSite = async (id: number) => { if (!confirm("هل تريد حذف الموقع؟")) { return; }
try {
  const response = await fetch("/api/sites", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(
      data?.error ||
        "لا يمكن حذف الموقع"
    );
    return;
  }

  if (editingSite?.id === id) {
    resetForm();
  }

  await loadData();
} catch (error) {
  console.error("DELETE SITE ERROR:", error);
  alert("حدث خطأ أثناء حذف الموقع");
}
};
const filteredSites = sites.filter((site) => { const text = search.trim().toLowerCase();
if (!text) {
  return true;
}

return (
  site.name
    .toLowerCase()
    .includes(text) ||
  site.address
    .toLowerCase()
    .includes(text) ||
  site.phone
    .toLowerCase().includes(text) ||
  site.customer.name
    .toLowerCase()
    .includes(text)
);
});
return ( <main
dir="rtl"
className="min-h-screen bg-gray-100 p-4 md:p-8"
> <div className="mx-auto max-w-6xl space-y-6">
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">
        المواقع والفروع
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        إدارة مواقع العملاء وربطها بأجهزة UPS
      </p>
    </section>

    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {editingSite
            ? "تعديل الموقع"
            : "إضافة موقع جديد"}
        </h2>

        {editingSite && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-300"
          >
            إلغاء التعديل
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block font-semibold">
            العميل
          </label>

          <select
            value={customerId}
            onChange={(e) =>
              handleCustomerChange(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              اختر العميل
            </option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            رقم هاتف العميل
          </label>

          <input
            value={
              selectedCustomer?.phone ||
              phone
            }
            readOnly
            placeholder="سيظهر تلقائيًا"
            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            الموقع / الفرع
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="مثال: فرع مدينة نصر"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            عنوان الموقع
          </label>

          <input
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            placeholder="عنوان الموقع"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {customerId && customerSites.length > 0 && (
        <div className="mt-6 rounded-xl bg-gray-50 p-4">

          <h3 className="mb-3 font-bold">
            مواقع هذا العميل
          </h3>

          <div className="grid gap-2 md:grid-cols-2">

            {customerSites.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => {
                  setEditingSite(site);
                  setName(site.name);
                  setAddress(site.address);
                  setPhone(site.phone);
                }}
                className="rounded-xl border border-gray-200 bg-white p-4 text-right hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="font-bold">
                  {site.name}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {site.address || "لا يوجد عنوان"}</div>

                <div className="mt-1 text-sm text-gray-500">
                  UPS: {site.ups?.length || 0}
                </div>
              </button>
            ))}

          </div>

        </div>
      )}

      <button
        type="button"
        onClick={saveSite}
        disabled={saving}
        className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving
          ? "جاري الحفظ..."
          : editingSite
          ? "حفظ التعديل"
          : "إضافة الموقع"}
      </button>

    </section>

    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-5">
        <h2 className="text-xl font-bold">
          قائمة المواقع
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          إجمالي المواقع: {sites.length}
        </p>
      </div>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="بحث باسم العميل أو الموقع أو العنوان..."
        className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />

      <div className="overflow-x-auto">

        <table className="w-full min-w-[900px]">

          <thead>
            <tr className="border-b bg-gray-50 text-right">

              <th className="p-4">
                العميل
              </th>

              <th className="p-4">
                الموقع
              </th>

              <th className="p-4">
                العنوان
              </th>

              <th className="p-4">
                الهاتف
              </th>

              <th className="p-4">
                UPS
              </th>

              <th className="p-4">
                الإجراءات
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500"
                >
                  جاري تحميل المواقع...
                </td>
              </tr>
            ) : filteredSites.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500"
                >
                  لا توجد نتائج
                </td>
              </tr>
            ) : (
              filteredSites.map((site) => (
                <tr
                  key={site.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >

                  <td className="p-4 font-semibold">
                    {site.customer?.name || "-"}
                  </td>

                  <td className="p-4">
                    {site.name}
                  </td>

                  <td className="p-4">
                    {site.address || "-"}
                  </td>

                  <td className="p-4">
                    {site.phone ||
                      site.customer?.phone ||
                      "-"}
                  </td>

                  <td className="p-4">
                    {site.ups?.length || 0}
                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          editSite(site)
                        }
                        className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteSite(site.id)
                        }
                        className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                      >
                        حذف
                      </button></div>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </section>

  </div>
</main>
); }