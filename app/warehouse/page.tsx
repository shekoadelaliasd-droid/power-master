"use client";

import { useEffect, useState } from "react";

type Battery = {
  id: number;
  type: string;
  power: string;
  quantity: number;
};

type UPS = {
  id: number;
  type: string;
  model: string;
  serial: string;
  power: string;
};

export default function WarehousePage() {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [ups, setUps] = useState<UPS[]>([]);

  const [batteryModal, setBatteryModal] = useState(false);
  const [upsModal, setUpsModal] = useState(false);

  const [editingBattery, setEditingBattery] = useState<Battery | null>(null);
  const [editingUps, setEditingUps] = useState<UPS | null>(null);

  const [batteryType, setBatteryType] = useState("");
  const [batteryPower, setBatteryPower] = useState("");
  const [batteryQuantity, setBatteryQuantity] = useState("");

  const [upsType, setUpsType] = useState("");
  const [upsModel, setUpsModel] = useState("");
  const [upsSerial, setUpsSerial] = useState("");
  const [upsPower, setUpsPower] = useState("");

  const [batterySearch, setBatterySearch] = useState("");
  const [upsSearch, setUpsSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingBattery, setSavingBattery] = useState(false);
  const [savingUps, setSavingUps] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [batteryRes, upsRes] = await Promise.all([
        fetch("/api/batteries", { cache: "no-store" }),
        fetch("/api/ups", { cache: "no-store" }),
      ]);

      if (!batteryRes.ok) {
        throw new Error("فشل تحميل البطاريات");
      }

      if (!upsRes.ok) {
        throw new Error("فشل تحميل أجهزة UPS");
      }

      const batteryData = await batteryRes.json();
      const upsData = await upsRes.json();

      setBatteries(Array.isArray(batteryData) ? batteryData : []);
      setUps(Array.isArray(upsData) ? upsData : []);
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);
      alert("حدث خطأ أثناء تحميل بيانات المخزن");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openBatteryAdd = () => {
    setEditingBattery(null);
    setBatteryType("");
    setBatteryPower("");
    setBatteryQuantity("");
    setBatteryModal(true);
  };

  const openBatteryEdit = (battery: Battery) => {
    setEditingBattery(battery);
    setBatteryType(battery.type);
    setBatteryPower(battery.power);
    setBatteryQuantity(String(battery.quantity));
    setBatteryModal(true);
  };

  const saveBattery = async () => {
    if (!batteryType.trim()) {
      alert("اكتب نوع البطارية");
      return;
    }

    if (!batteryPower.trim()) {
      alert("اكتب قدرة البطارية");
      return;
    }

    if (batteryQuantity.trim() === "") {
      alert("اكتب كمية البطارية");
      return;
    }

    const quantity = Number(batteryQuantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      alert("اكتب كمية صحيحة");
      return;
    }

    try {
      setSavingBattery(true);

      const method = editingBattery ? "PUT" : "POST";

      const response = await fetch("/api/batteries", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingBattery?.id,
          type: batteryType.trim(),
          power: batteryPower.trim(),
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("BATTERY SAVE ERROR:", errorData);

        alert(
          errorData?.error || "حدث خطأ أثناء حفظ البطارية"
        );

        return;
      }

      setBatteryModal(false);
      await loadData();
    } catch (error) {
      console.error("BATTERY SAVE ERROR:", error);
      alert("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSavingBattery(false);
    }
  };

  const deleteBattery = async (id: number) => {
    if (!confirm("هل تريد حذف البطارية؟")) {
      return;
    }

    try {const response = await fetch("/api/batteries", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        alert("حدث خطأ أثناء حذف البطارية");
        return;
      }

      await loadData();
    } catch (error) {
      console.error("BATTERY DELETE ERROR:", error);
      alert("حدث خطأ في الاتصال بالخادم");
    }
  };

  const openUpsAdd = () => {
    setEditingUps(null);
    setUpsType("");
    setUpsModel("");
    setUpsSerial("");
    setUpsPower("");
    setUpsModal(true);
  };

  const openUpsEdit = (item: UPS) => {
    setEditingUps(item);
    setUpsType(item.type);
    setUpsModel(item.model);
    setUpsSerial(item.serial);
    setUpsPower(item.power);
    setUpsModal(true);
  };

  const saveUps = async () => {
    if (
      !upsType.trim() ||
      !upsModel.trim() ||
      !upsSerial.trim() ||
      !upsPower.trim()
    ) {
      alert("من فضلك أكمل بيانات الجهاز");
      return;
    }

    try {
      setSavingUps(true);

      const method = editingUps ? "PUT" : "POST";

      const response = await fetch("/api/ups", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUps?.id,
          type: upsType.trim(),
          model: upsModel.trim(),
          serial: upsSerial.trim(),
          power: upsPower.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("UPS SAVE ERROR:", errorData);

        alert(
          errorData?.error || "حدث خطأ أثناء حفظ جهاز UPS"
        );

        return;
      }

      setUpsModal(false);
      await loadData();
    } catch (error) {
      console.error("UPS SAVE ERROR:", error);
      alert("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSavingUps(false);
    }
  };

  const deleteUps = async (id: number) => {
    if (!confirm("هل تريد حذف جهاز UPS؟")) {
      return;
    }

    try {
      const response = await fetch("/api/ups", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        alert("حدث خطأ أثناء حذف جهاز UPS");
        return;
      }

      await loadData();
    } catch (error) {
      console.error("UPS DELETE ERROR:", error);
      alert("حدث خطأ في الاتصال بالخادم");
    }
  };

  const filteredBatteries = batteries.filter((battery) => {
    const search = batterySearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      battery.type.toLowerCase().includes(search) ||
      battery.power.toLowerCase().includes(search)
    );
  });

  const filteredUps = ups.filter((item) => {
    const search = upsSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      item.type.toLowerCase().includes(search) ||
      item.model.toLowerCase().includes(search) ||
      item.serial.toLowerCase().includes(search) ||
      item.power.toLowerCase().includes(search)
    );
  });

  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              إدارة المخزن
            </h1>

            <p className="text-sm text-gray-500">
              إدارة البطاريات وأجهزة UPS
            </p>
          </div>
        </section>

        {/* البطاريات */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                البطاريات
              </h2>

              <p className="text-sm text-gray-500">إجمالي الأنواع: {batteries.length}
              </p>
            </div>

            <button
              onClick={openBatteryAdd}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              + إضافة بطارية
            </button>
          </div>

          <input
            value={batterySearch}
            onChange={(e) => setBatterySearch(e.target.value)}
            placeholder="بحث بالنوع أو القدرة..."
            className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b bg-gray-50 text-right">
                  <th className="p-4">النوع</th>
                  <th className="p-4">القدرة</th>
                  <th className="p-4">الكمية</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500"
                    >
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : filteredBatteries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500"
                    >
                      لا توجد بطاريات
                    </td>
                  </tr>
                ) : (
                  filteredBatteries.map((battery) => (
                    <tr
                      key={battery.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold">
                        {battery.type}
                      </td>

                      <td className="p-4">
                        {battery.power}
                      </td>

                      <td className="p-4 font-bold">
                        {battery.quantity}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openBatteryEdit(battery)
                            }
                            className="rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300"
                          >
                            تعديل
                          </button>

                          <button
                            onClick={() =>
                              deleteBattery(battery.id)
                            }
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 transition hover:bg-red-200"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* أجهزة UPS */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                أجهزة UPS
              </h2>

              <p className="text-sm text-gray-500">
                إجمالي الأجهزة: {ups.length}
              </p>
            </div>

            <button
              onClick={openUpsAdd}
              className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
            >
              + إضافة جهاز UPS
            </button>
          </div>

          <input
          value={upsSearch}
            onChange={(e) => setUpsSearch(e.target.value)}
            placeholder="بحث بالنوع أو الموديل أو السيريال..."
            className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b bg-gray-50 text-right">
                  <th className="p-4">نوع الجهاز</th>
                  <th className="p-4">الموديل</th>
                  <th className="p-4">Serial Number</th>
                  <th className="p-4">القدرة</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-500"
                    >
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : filteredUps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-500"
                    >
                      لا توجد أجهزة UPS
                    </td>
                  </tr>
                ) : (
                  filteredUps.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold">
                        {item.type}
                      </td>

                      <td className="p-4">
                        {item.model}
                      </td>

                      <td className="p-4 font-mono">
                        {item.serial}
                      </td>

                      <td className="p-4">
                        {item.power}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openUpsEdit(item)}
                            className="rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300"
                          >
                            تعديل
                          </button>

                          <button
                            onClick={() => deleteUps(item.id)}
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 transition hover:bg-red-200"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal البطارية */}

      {batteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingBattery
                  ? "تعديل بطارية"
                  : "إضافة بطارية"}
              </h3>

              <button
                onClick={() => setBatteryModal(false)}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block font-semibold">
                  نوع البطارية
                </label>

                <input
                  value={batteryType}
                  onChange={(e) =>
                    setBatteryType(e.target.value)
                  }placeholder="مثال: بطارية رصاص"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  القدرة
                </label>

                <input
                  value={batteryPower}
                  onChange={(e) =>
                    setBatteryPower(e.target.value)
                  }
                  placeholder="مثال: 12V 7Ah"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  الكمية
                </label>

                <input
                  type="number"
                  min="0"
                  value={batteryQuantity}
                  onChange={(e) =>
                    setBatteryQuantity(e.target.value)
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveBattery}
                  disabled={savingBattery}
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingBattery ? "جاري الحفظ..." : "حفظ"}
                </button>

                <button
                  onClick={() => setBatteryModal(false)}
                  disabled={savingBattery}
                  className="flex-1 rounded-xl bg-gray-200 py-3 font-bold transition hover:bg-gray-300 disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal UPS */}

      {upsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingUps
                  ? "تعديل جهاز UPS"
                  : "إضافة جهاز UPS"}
              </h3>

              <button
                onClick={() => setUpsModal(false)}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block font-semibold">
                  نوع الجهاز
                </label>

                <input
                  value={upsType}
                  onChange={(e) =>
                    setUpsType(e.target.value)
                  }
                  placeholder="مثال: Online UPS"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  الموديل
                </label>

                <input
                  value={upsModel}
                  onChange={(e) =>
                    setUpsModel(e.target.value)
                  }
                  placeholder="مثال: APC 10KVA"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Serial Number
                </label>

                <input
                  value={upsSerial}
                  onChange={(e) =>
                    setUpsSerial(e.target.value)
                  }
                  placeholder="Serial Number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  القدرة
                </label>

                <input
                  value={upsPower}
                  onChange={(e) =>
                    setUpsPower(e.target.value)
                  }
                  placeholder="مثال: 10 kVA"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveUps}
                  disabled={savingUps}
                  className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingUps ? "جاري الحفظ..." : "حفظ"}
                </button>

                <button
                  onClick={() => setUpsModal(false)}
                  disabled={savingUps}
                  className="flex-1 rounded-xl bg-gray-200 py-3 font-bold transition hover:bg-gray-300 disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}