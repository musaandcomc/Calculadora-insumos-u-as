import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Scissors,
  Settings2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Package,
  Printer,
} from "lucide-react";

const COLORS = {
  chocolate: "#E07830",
  coffee: "#2A211D",
  oldLace: "#F7F1E3",
  garnet: "#690500",
};

const money = (n) =>
  (isNaN(n) ? 0 : n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const num = (v) => parseFloat(v) || 0;

const costoPorServicioInsumo = (i) => {
  const costoTotal = num(i.costoTotal);
  if (i.tipo === "descartable") return costoTotal;
  const rinde = num(i.rinde);
  return rinde > 0 ? costoTotal / rinde : 0;
};

function emptyInsumo() {
  return { id: crypto.randomUUID(), nombre: "", tipo: "reutilizable", costoTotal: "", rinde: "" };
}

function emptyGasto() {
  return { id: crypto.randomUUID(), nombre: "", monto: "" };
}

export default function CalculadoraEsteticas() {
  // Configuración general
  const [configAbierta, setConfigAbierta] = useState(true);
  const [tarifaHora, setTarifaHora] = useState(6000);
  const [serviciosPorMes, setServiciosPorMes] = useState(80);
  const [gastosFijos, setGastosFijos] = useState([
    { id: crypto.randomUUID(), nombre: "Alquiler", monto: "" },
    { id: crypto.randomUUID(), nombre: "Luz", monto: "" },
    { id: crypto.randomUUID(), nombre: "Gas", monto: "" },
  ]);

  // Librería de insumos guardados
  const [libreriaAbierta, setLibreriaAbierta] = useState(false);
  const [insumosGuardados, setInsumosGuardados] = useState([]);
  const [seleccionLibreria, setSeleccionLibreria] = useState("");

  // Servicio en construcción
  const [editandoId, setEditandoId] = useState(null);
  const [nombreServicio, setNombreServicio] = useState("");
  const [tiempoMin, setTiempoMin] = useState(45);
  const [insumos, setInsumos] = useState([emptyInsumo()]);
  const [margenPct, setMargenPct] = useState(30);
  const [servicios, setServicios] = useState([]);

  const nombreServicioRef = useRef(null);
  const [pdfListo, setPdfListo] = useState(false);

  useEffect(() => {
    if (window.jspdf) {
      setPdfListo(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => setPdfListo(true);
    document.body.appendChild(script);
  }, []);

  const descargarPDF = () => {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(42, 33, 29);
    doc.text("Lista de precios", 14, y);

    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(224, 120, 48);
    doc.text("Muse & Co.", 14, y);

    y += 14;
    doc.setDrawColor(216, 207, 192);
    doc.line(14, y, 196, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    servicios.forEach((s) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(42, 33, 29);
      doc.text(s.nombre, 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(224, 120, 48);
      doc.text(money(s.precio), 196, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 9;
    });

    y += 12;
    doc.setFontSize(9);
    doc.setTextColor(42, 33, 29);
    doc.textWithLink("Sitio web creado por Muse & Co", 14, y, {
      url: "https://www.instagram.com/muse.studiocreativo/",
    });

    doc.save("lista-de-precios-muse-co.pdf");
  };

  const totalGastosFijos = gastosFijos.reduce((acc, g) => acc + num(g.monto), 0);
  const costoFijoPorServicio =
    num(serviciosPorMes) > 0 ? totalGastosFijos / num(serviciosPorMes) : 0;

  const costoInsumos = insumos.reduce((acc, i) => acc + costoPorServicioInsumo(i), 0);
  const manoDeObra = (num(tiempoMin) / 60) * num(tarifaHora);
  const subtotalCostos = costoInsumos + costoFijoPorServicio;
  const costoTotalServicio = subtotalCostos + manoDeObra;
  const ganancia = costoTotalServicio * (num(margenPct) / 100);
  const precioFinal = costoTotalServicio + ganancia;

  // --- Insumos del servicio actual ---
  const actualizarInsumo = (id, campo, valor) =>
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));

  const agregarInsumo = () => setInsumos((prev) => [...prev, emptyInsumo()]);

  const quitarInsumo = (id) =>
    setInsumos((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const agregarDesdeLibreria = (libreriaId) => {
    const base = insumosGuardados.find((i) => i.id === libreriaId);
    if (!base) return;
    setInsumos((prev) => [
      ...prev.filter((i) => i.nombre.trim() !== "" || i.costoTotal !== ""),
      { id: crypto.randomUUID(), nombre: base.nombre, tipo: base.tipo, costoTotal: base.costoTotal, rinde: base.rinde },
    ]);
    setSeleccionLibreria("");
  };

  // --- Gastos fijos ---
  const actualizarGasto = (id, campo, valor) =>
    setGastosFijos((prev) => prev.map((g) => (g.id === id ? { ...g, [campo]: valor } : g)));

  const agregarGasto = () => setGastosFijos((prev) => [...prev, emptyGasto()]);

  const quitarGasto = (id) => setGastosFijos((prev) => prev.filter((g) => g.id !== id));

  // --- Librería de insumos ---
  const agregarInsumoGuardado = () =>
    setInsumosGuardados((prev) => [...prev, emptyInsumo()]);

  const actualizarInsumoGuardado = (id, campo, valor) =>
    setInsumosGuardados((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));

  const quitarInsumoGuardado = (id) =>
    setInsumosGuardados((prev) => prev.filter((i) => i.id !== id));

  // --- Servicio: guardar / editar / borrar ---
  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombreServicio("");
    setTiempoMin(45);
    setInsumos([emptyInsumo()]);
    setMargenPct(30);
    nombreServicioRef.current?.focus();
  };

  const guardarServicio = () => {
    if (!nombreServicio.trim()) return;
    const datos = {
      nombre: nombreServicio.trim(),
      tiempoMin: num(tiempoMin),
      insumos: insumos.map((i) => ({ ...i })),
      margenPct: num(margenPct),
      costoInsumos,
      manoDeObra,
      costoFijo: costoFijoPorServicio,
      costoTotalServicio,
      ganancia,
      precio: precioFinal,
    };

    if (editandoId) {
      setServicios((prev) => prev.map((s) => (s.id === editandoId ? { ...s, ...datos } : s)));
    } else {
      setServicios((prev) => [...prev, { id: crypto.randomUUID(), ...datos }]);
    }
    limpiarFormulario();
  };

  const editarServicio = (s) => {
    setEditandoId(s.id);
    setNombreServicio(s.nombre);
    setTiempoMin(s.tiempoMin);
    setInsumos(s.insumos.map((i) => ({ ...i, id: crypto.randomUUID() })));
    setMargenPct(s.margenPct);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => nombreServicioRef.current?.focus(), 300);
  };

  const borrarServicio = (id) => {
    setServicios((prev) => prev.filter((s) => s.id !== id));
    if (editandoId === id) limpiarFormulario();
  };

  const inputBase = { borderColor: COLORS.coffee, color: COLORS.coffee };
  const softBorder = { borderColor: "#D8CFC0", color: COLORS.coffee };

  return (
    <div
      className="min-h-full w-full flex justify-center px-4 py-10"
      style={{ backgroundColor: COLORS.oldLace, fontFamily: "'Schibsted Grotesk', sans-serif" }}
    >
      <div className="w-full max-w-3xl">
        {/* Encabezado */}
        <div
          className="flex items-baseline justify-between mb-8 border-b-2 pb-4"
          style={{ borderColor: COLORS.coffee }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.coffee }}>
              Calculadora de precios
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: COLORS.chocolate }}>
              Muse & Co.
            </p>
          </div>
          <Scissors size={28} style={{ color: COLORS.chocolate }} />
        </div>

        <p className="text-sm mb-8" style={{ color: COLORS.coffee, opacity: 0.7 }}>
          Completá los pasos de abajo y al final vas a ver cuánto te conviene cobrar. No hace
          falta saber de números: nosotros hacemos las cuentas.
        </p>

        {/* PASO 1 · Configuración general */}
        <div className="mb-6 border-2 rounded-lg" style={{ borderColor: COLORS.coffee }}>
          <button
            onClick={() => setConfigAbierta((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: COLORS.coffee }}>
              <Settings2 size={16} /> Paso 1 · Contanos sobre tu local (solo la primera vez)
            </span>
            {configAbierta ? (
              <ChevronUp size={18} style={{ color: COLORS.coffee }} />
            ) : (
              <ChevronDown size={18} style={{ color: COLORS.coffee }} />
            )}
          </button>

          {configAbierta && (
            <div className="px-4 pb-5 pt-1 space-y-6">
              {/* Tarifa por hora */}
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: COLORS.coffee }}>
                  ¿Cuánto querés cobrar por cada hora de tu trabajo?
                </label>
                <div
                  className="flex items-center gap-2 border-2 rounded px-3 py-2 w-40"
                  style={{ borderColor: COLORS.coffee, backgroundColor: "white" }}
                >
                  <span style={{ color: COLORS.coffee, opacity: 0.6 }}>$</span>
                  <input
                    type="number"
                    value={tarifaHora}
                    onChange={(e) => setTarifaHora(e.target.value)}
                    className="w-full outline-none bg-transparent text-right font-semibold"
                    style={{ color: COLORS.coffee }}
                  />
                  <span className="text-sm" style={{ color: COLORS.coffee, opacity: 0.6 }}>
                    /hora
                  </span>
                </div>
              </div>

              {/* Servicios estimados por mes */}
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: COLORS.coffee }}>
                  ¿Cuántos servicios hacés por mes, más o menos?
                </label>
                <p className="text-xs mb-2" style={{ color: COLORS.coffee, opacity: 0.55 }}>
                  Con este número repartimos entre todos los servicios lo que gastás en el local.
                </p>
                <input
                  type="number"
                  value={serviciosPorMes}
                  onChange={(e) => setServiciosPorMes(e.target.value)}
                  className="w-40 border-2 rounded px-3 py-2 outline-none text-right font-semibold"
                  style={{ borderColor: COLORS.coffee, color: COLORS.coffee, backgroundColor: "white" }}
                />
              </div>

              {/* Gastos fijos */}
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: COLORS.coffee }}>
                  ¿Qué gastos fijos tenés todos los meses?
                </label>
                <p className="text-xs mb-2" style={{ color: COLORS.coffee, opacity: 0.55 }}>
                  Alquiler, luz, gas... todo lo que pagás tengas clientas o no.
                </p>
                <div className="space-y-2">
                  {gastosFijos.map((g) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ej: Alquiler"
                        value={g.nombre}
                        onChange={(e) => actualizarGasto(g.id, "nombre", e.target.value)}
                        className="flex-1 border rounded px-2 py-1.5 outline-none text-sm"
                        style={softBorder}
                      />
                      <div className="flex items-center border rounded px-2 py-1.5" style={{ borderColor: "#D8CFC0" }}>
                        <span className="text-xs mr-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={g.monto}
                          onChange={(e) => actualizarGasto(g.id, "monto", e.target.value)}
                          className="w-24 outline-none text-sm text-right"
                          style={{ color: COLORS.coffee }}
                        />
                      </div>
                      <button onClick={() => quitarGasto(g.id)} style={{ color: COLORS.garnet }} aria-label="Quitar gasto">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={agregarGasto}
                  className="flex items-center gap-1 text-sm font-medium mt-2"
                  style={{ color: COLORS.chocolate }}
                >
                  <Plus size={16} /> Agregar otro gasto
                </button>

                <div
                  className="flex justify-between text-sm mt-4 pt-3 border-t"
                  style={{ borderColor: "#D8CFC0", color: COLORS.coffee }}
                >
                  <span>Total de gastos por mes</span>
                  <span className="font-medium">{money(totalGastosFijos)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: COLORS.coffee }}>
                  <span>Eso significa, por cada servicio</span>
                  <span className="font-semibold" style={{ color: COLORS.chocolate }}>
                    {money(costoFijoPorServicio)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Librería de insumos guardados */}
        <div className="mb-10 border-2 rounded-lg" style={{ borderColor: COLORS.coffee }}>
          <button
            onClick={() => setLibreriaAbierta((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: COLORS.coffee }}>
              <Package size={16} /> Tus insumos guardados (para no escribirlos siempre)
            </span>
            {libreriaAbierta ? (
              <ChevronUp size={18} style={{ color: COLORS.coffee }} />
            ) : (
              <ChevronDown size={18} style={{ color: COLORS.coffee }} />
            )}
          </button>

          {libreriaAbierta && (
            <div className="px-4 pb-5 pt-1">
              <p className="text-xs mb-3" style={{ color: COLORS.coffee, opacity: 0.55 }}>
                Cargá acá una sola vez los productos que usás seguido. Después, cuando arms un
                servicio, los vas a poder elegir de una lista en vez de escribirlos de nuevo.
                Marcá "Reutilizable" si el producto rinde para varios servicios (ej. un esmalte),
                o "Descartable" si se gasta entero en cada servicio (ej. un algodón, una lima
                descartable).
              </p>

              <div className="space-y-3">
                {insumosGuardados.map((i) => (
                  <div key={i.id} className="border rounded p-2.5" style={{ borderColor: "#D8CFC0" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Ej: Esmalte semipermanente"
                        value={i.nombre}
                        onChange={(e) => actualizarInsumoGuardado(i.id, "nombre", e.target.value)}
                        className="flex-1 border rounded px-2 py-1.5 outline-none text-sm"
                        style={softBorder}
                      />
                      <select
                        value={i.tipo}
                        onChange={(e) => actualizarInsumoGuardado(i.id, "tipo", e.target.value)}
                        className="border rounded px-2 py-1.5 outline-none text-sm"
                        style={softBorder}
                      >
                        <option value="reutilizable">Reutilizable</option>
                        <option value="descartable">Descartable</option>
                      </select>
                      <button onClick={() => quitarInsumoGuardado(i.id)} style={{ color: COLORS.garnet }} aria-label="Quitar insumo">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded px-2 py-1.5" style={{ borderColor: "#D8CFC0" }}>
                        <span className="text-xs mr-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                          Cuesta $
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={i.costoTotal}
                          onChange={(e) => actualizarInsumoGuardado(i.id, "costoTotal", e.target.value)}
                          className="w-20 outline-none text-sm text-right"
                          style={{ color: COLORS.coffee }}
                        />
                      </div>
                      {i.tipo === "reutilizable" && (
                        <div className="flex items-center border rounded px-2 py-1.5" style={{ borderColor: "#D8CFC0" }}>
                          <span className="text-xs mr-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                            Rinde para
                          </span>
                          <input
                            type="number"
                            placeholder="15"
                            value={i.rinde}
                            onChange={(e) => actualizarInsumoGuardado(i.id, "rinde", e.target.value)}
                            className="w-14 outline-none text-sm text-right"
                            style={{ color: COLORS.coffee }}
                          />
                          <span className="text-xs ml-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                            servicios
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={agregarInsumoGuardado}
                className="flex items-center gap-1 text-sm font-medium mt-3"
                style={{ color: COLORS.chocolate }}
              >
                <Plus size={16} /> Guardar un nuevo insumo
              </button>
            </div>
          )}
        </div>

        {/* PASO 2 · Servicio */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm" style={{ color: COLORS.coffee }}>
            Paso 2 · Contanos sobre el servicio
          </h2>
          {editandoId && (
            <button
              onClick={limpiarFormulario}
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: COLORS.garnet }}
            >
              <X size={14} /> Cancelar edición
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Formulario de servicio */}
          <div className="md:col-span-3">
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.coffee }}>
                ¿Qué servicio vas a cobrar?
              </label>
              <input
                ref={nombreServicioRef}
                type="text"
                placeholder="Ej: Esmaltado semipermanente"
                value={nombreServicio}
                onChange={(e) => setNombreServicio(e.target.value)}
                className="w-full border-2 rounded px-3 py-2 outline-none"
                style={inputBase}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.coffee }}>
                ¿Cuántos minutos te lleva hacerlo?
              </label>
              <input
                type="number"
                value={tiempoMin}
                onChange={(e) => setTiempoMin(e.target.value)}
                className="w-32 border-2 rounded px-3 py-2 outline-none"
                style={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.coffee }}>
                ¿Qué productos usaste?
              </label>

              {insumosGuardados.length > 0 && (
                <select
                  value={seleccionLibreria}
                  onChange={(e) => agregarDesdeLibreria(e.target.value)}
                  className="w-full border-2 rounded px-3 py-2 outline-none text-sm mb-3"
                  style={inputBase}
                >
                  <option value="">+ Elegir de tus insumos guardados...</option>
                  {insumosGuardados
                    .filter((i) => i.nombre.trim())
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} ({i.tipo === "descartable" ? "descartable" : `rinde ${i.rinde || "?"}`})
                      </option>
                    ))}
                </select>
              )}

              <p className="text-xs mb-3" style={{ color: COLORS.coffee, opacity: 0.55 }}>
                O cargalo manual: poné cuánto sale el producto completo y para cuántos servicios
                te alcanza. Por ejemplo: un esmalte de $8.000 que rinde para 15 uñas.
              </p>

              <div className="space-y-3">
                {insumos.map((insumo) => {
                  const costoPorServicio = costoPorServicioInsumo(insumo);
                  return (
                    <div key={insumo.id} className="border rounded p-2.5" style={{ borderColor: "#D8CFC0" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Ej: Esmalte semipermanente"
                          value={insumo.nombre}
                          onChange={(e) => actualizarInsumo(insumo.id, "nombre", e.target.value)}
                          className="flex-1 border rounded px-2 py-1.5 outline-none text-sm"
                          style={softBorder}
                        />
                        <select
                          value={insumo.tipo}
                          onChange={(e) => actualizarInsumo(insumo.id, "tipo", e.target.value)}
                          className="border rounded px-2 py-1.5 outline-none text-sm"
                          style={softBorder}
                        >
                          <option value="reutilizable">Reutilizable</option>
                          <option value="descartable">Descartable</option>
                        </select>
                        <button
                          onClick={() => quitarInsumo(insumo.id)}
                          className="p-1"
                          style={{ color: COLORS.garnet, opacity: insumos.length > 1 ? 1 : 0.25 }}
                          aria-label="Quitar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center border rounded px-2 py-1.5" style={{ borderColor: "#D8CFC0" }}>
                          <span className="text-xs mr-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                            Cuesta $
                          </span>
                          <input
                            type="number"
                            placeholder="0"
                            value={insumo.costoTotal}
                            onChange={(e) => actualizarInsumo(insumo.id, "costoTotal", e.target.value)}
                            className="w-20 outline-none text-sm text-right"
                            style={{ color: COLORS.coffee }}
                          />
                        </div>
                        {insumo.tipo === "reutilizable" ? (
                          <div className="flex items-center border rounded px-2 py-1.5" style={{ borderColor: "#D8CFC0" }}>
                            <span className="text-xs mr-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                              Rinde para
                            </span>
                            <input
                              type="number"
                              placeholder="15"
                              value={insumo.rinde}
                              onChange={(e) => actualizarInsumo(insumo.id, "rinde", e.target.value)}
                              className="w-14 outline-none text-sm text-right"
                              style={{ color: COLORS.coffee }}
                            />
                            <span className="text-xs ml-1" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                              servicios
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: COLORS.coffee, opacity: 0.5 }}>
                            se gasta entero en este servicio
                          </span>
                        )}
                        {costoPorServicio > 0 && (
                          <span className="text-xs ml-auto" style={{ color: COLORS.coffee, opacity: 0.45 }}>
                            → {money(costoPorServicio)} en este servicio
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={agregarInsumo}
                className="flex items-center gap-1 text-sm font-medium mt-3"
                style={{ color: COLORS.chocolate }}
              >
                <Plus size={16} /> Agregar otro producto
              </button>
            </div>
          </div>

          {/* Ticket de resultado */}
          <div className="md:col-span-2">
            <div
              className="border-2 rounded-lg p-5 sticky top-4"
              style={{ borderColor: COLORS.coffee, backgroundColor: "white", borderStyle: "dashed" }}
            >
              <p
                className="text-xs uppercase tracking-wide mb-4"
                style={{ color: COLORS.coffee, opacity: 0.5, letterSpacing: "0.02em" }}
              >
                Paso 3 · Tu precio
              </p>

              <p className="text-xs font-medium mb-1" style={{ color: COLORS.coffee, opacity: 0.6 }}>
                Costos reales (lo que sale de tu bolsillo)
              </p>
              <div className="space-y-2 text-sm mb-3" style={{ color: COLORS.coffee }}>
                <div className="flex justify-between">
                  <span>Productos usados</span>
                  <span className="font-medium">{money(costoInsumos)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gastos del local</span>
                  <span className="font-medium">{money(costoFijoPorServicio)}</span>
                </div>
              </div>

              <div
                className="flex justify-between text-sm pt-2 border-t mb-3"
                style={{ borderColor: "#D8CFC0", color: COLORS.coffee }}
              >
                <span>Subtotal de costos</span>
                <span className="font-semibold">{money(subtotalCostos)}</span>
              </div>

              <div className="pt-3 border-t-2" style={{ borderColor: COLORS.coffee }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: COLORS.coffee }}>
                    Tu hora de trabajo ({tiempoMin || 0} min)
                  </span>
                  <span className="font-medium" style={{ color: COLORS.coffee }}>
                    {money(manoDeObra)}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: COLORS.coffee, opacity: 0.55 }}>
                  Esto ya es ganancia para vos: es lo que cobrás por tu tiempo, no un gasto.
                </p>
              </div>

              {/* Margen de ganancia */}
              <div className="mt-4 pt-4 border-t-2" style={{ borderColor: COLORS.coffee }}>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1" style={{ color: COLORS.coffee }}>
                  <Sparkles size={14} style={{ color: COLORS.chocolate }} />
                  Ganancia extra, además de tu hora
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: COLORS.coffee, opacity: 0.6 }}>
                  Cobrar tu hora ya es ganar dinero. Este porcentaje es una ganancia ADICIONAL, por
                  arriba de eso, para hacer crecer tu negocio, comprar herramientas o ahorrar. Se
                  recomienda entre 20% y 40% extra.
                </p>
                <div
                  className="flex items-center gap-2 border-2 rounded px-3 py-1.5 w-28"
                  style={{ borderColor: COLORS.coffee, backgroundColor: COLORS.oldLace }}
                >
                  <input
                    type="number"
                    value={margenPct}
                    onChange={(e) => setMargenPct(e.target.value)}
                    className="w-full outline-none bg-transparent text-right font-semibold"
                    style={{ color: COLORS.coffee }}
                  />
                  <span className="text-sm" style={{ color: COLORS.coffee, opacity: 0.6 }}>
                    %
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2" style={{ color: COLORS.coffee }}>
                  <span>Ganancia extra en este servicio</span>
                  <span className="font-medium">{money(ganancia)}</span>
                </div>
              </div>

              <div className="border-t-2 pt-3 mt-4 mb-5" style={{ borderColor: COLORS.coffee }}>
                <div className="flex justify-between items-end">
                  <span className="text-sm" style={{ color: COLORS.coffee }}>
                    Precio final a cobrar
                  </span>
                  <span className="text-2xl font-bold" style={{ color: COLORS.chocolate }}>
                    {money(precioFinal)}
                  </span>
                </div>
              </div>

              <button
                onClick={guardarServicio}
                disabled={!nombreServicio.trim()}
                className="w-full py-2.5 rounded font-medium text-sm"
                style={{
                  backgroundColor: nombreServicio.trim() ? COLORS.chocolate : "#E8DFCF",
                  color: nombreServicio.trim() ? "white" : "#A89C87",
                }}
              >
                {editandoId ? "Guardar cambios" : "Guardar servicio"}
              </button>
            </div>
          </div>
        </div>

        {/* Servicios guardados */}
        {servicios.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold" style={{ color: COLORS.coffee }}>
                Tu lista de precios
              </h2>
              <button
                onClick={descargarPDF}
                disabled={!pdfListo}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded"
                style={{
                  backgroundColor: pdfListo ? COLORS.coffee : "#D8CFC0",
                  color: COLORS.oldLace,
                }}
              >
                <Printer size={15} /> {pdfListo ? "Descargar PDF" : "Preparando..."}
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: COLORS.coffee, opacity: 0.55 }}>
              Tocá el lápiz para editar un servicio, o "Descargar PDF" para bajar el archivo con
              tu lista de precios.
            </p>
            <div className="border-t-2" style={{ borderColor: COLORS.coffee }}>
              {servicios.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3 border-b"
                  style={{
                    borderColor: "#E8DFCF",
                    backgroundColor: editandoId === s.id ? "white" : "transparent",
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: COLORS.coffee }}>
                      {s.nombre}
                    </p>
                    <p className="text-xs" style={{ color: COLORS.coffee, opacity: 0.55 }}>
                      {s.tiempoMin} min · costo {money(s.costoTotalServicio)} · ganancia extra {money(s.ganancia)} ({s.margenPct}%)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold" style={{ color: COLORS.chocolate }}>
                      {money(s.precio)}
                    </span>
                    <button onClick={() => editarServicio(s)} style={{ color: COLORS.coffee }} aria-label="Editar servicio">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => borrarServicio(s.id)} style={{ color: COLORS.garnet }} aria-label="Borrar servicio">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer de la app */}
        <footer className="mt-14 pt-5 text-center text-sm" style={{ borderTop: `1px solid #D8CFC0`, color: COLORS.coffee, opacity: 0.75 }}>
          <p>
            Diseño Web & Social Media por{" "}
            <a
              href="https://www.instagram.com/muse.studiocreativo/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
              style={{ color: COLORS.chocolate }}
            >
              Muse & Co
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
