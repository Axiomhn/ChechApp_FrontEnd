import { useEffect, useState } from "react"
import {
  Save,
  Printer,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Info,
} from "lucide-react"
import { getAppApi } from "@/lib/app-api"
import OffsetCard from "@/components/calibration/OffsetCard"
import ConfirmModal from "@/components/ui/ConfirmModal"
import type { AppSettings } from "@/types/electron"
import {
  defaultCalibrationSettings,
  type CalibrationSettings,
  type PrinterInfo,
} from "@/types/calibration"

function mapApiSettings(data: AppSettings): CalibrationSettings {
  return {
    printer_name: data.printer_name || "",
    offset_cheque_fecha_x: parseInt(data.offset_cheque_fecha_x ?? "0"),
    offset_cheque_fecha_y: parseInt(data.offset_cheque_fecha_y ?? "0"),
    offset_cheque_monto_x: parseInt(data.offset_cheque_monto_x ?? "0"),
    offset_cheque_monto_y: parseInt(data.offset_cheque_monto_y ?? "0"),
    offset_cheque_beneficiario_x: parseInt(data.offset_cheque_beneficiario_x ?? "0"),
    offset_cheque_beneficiario_y: parseInt(data.offset_cheque_beneficiario_y ?? "0"),
    offset_cheque_letras_x: parseInt(data.offset_cheque_letras_x ?? "0"),
    offset_cheque_letras_y: parseInt(data.offset_cheque_letras_y ?? "0"),
    fuente_tamano: parseInt(data.fuente_tamano ?? "12"),
  }
}

const FONT_SIZE_MIN = 8
const FONT_SIZE_MAX = 20
const FONT_SIZE_OPTIONS = Array.from(
  { length: FONT_SIZE_MAX - FONT_SIZE_MIN + 1 },
  (_, i) => FONT_SIZE_MIN + i
)

const OFFSET_SUMMARY = [
  { label: "Fecha", xKey: "offset_cheque_fecha_x", yKey: "offset_cheque_fecha_y" },
  { label: "Nombre", xKey: "offset_cheque_beneficiario_x", yKey: "offset_cheque_beneficiario_y" },
  { label: "Letras", xKey: "offset_cheque_letras_x", yKey: "offset_cheque_letras_y" },
  { label: "Monto", xKey: "offset_cheque_monto_x", yKey: "offset_cheque_monto_y" },
] as const

function withResetOffsets(settings: CalibrationSettings): CalibrationSettings {
  return {
    ...settings,
    offset_cheque_fecha_x: 0,
    offset_cheque_fecha_y: 0,
    offset_cheque_monto_x: 0,
    offset_cheque_monto_y: 0,
    offset_cheque_beneficiario_x: 0,
    offset_cheque_beneficiario_y: 0,
    offset_cheque_letras_x: 0,
    offset_cheque_letras_y: 0,
  }
}

export default function CalibrationPage() {
  const [printers, setPrinters] = useState<PrinterInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [settings, setSettings] = useState<CalibrationSettings>(
    defaultCalibrationSettings()
  )
  const [showResetModal, setShowResetModal] = useState(false)

  useEffect(() => {
    let active = true
    const api = getAppApi()

    Promise.all([api.config.getPrinters(), api.config.getSettings()])
      .then(([printerList, res]) => {
        if (!active) return
        setPrinters(printerList || [])
        if (res.success && res.data) {
          setSettings(mapApiSettings(res.data))
        }
      })
      .catch((err) => console.error("Error cargando calibraciones:", err))

    return () => {
      active = false
    }
  }, [])

  const persistSettings = async (
    nextSettings: CalibrationSettings,
    successMessage: string
  ) => {
    setLoading(true)
    setSuccessMsg("")
    try {
      const res = await getAppApi().config.saveSettings(nextSettings)
      if (res.success) {
        const saved = res.data ? mapApiSettings(res.data) : nextSettings
        setSettings(saved)
        setSuccessMsg(successMessage)
        setTimeout(() => setSuccessMsg(""), 4000)
        return true
      }
      alert("Error al guardar configuración: " + res.error)
      return false
    } catch (err) {
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    await persistSettings(
      settings,
      "Configuración guardada localmente en este equipo."
    )
  }

  const handleConfirmReset = async () => {
    setShowResetModal(false)
    const resetSettings = withResetOffsets(settings)
    await persistSettings(
      resetSettings,
      "Offsets restablecidos y guardados en este equipo."
    )
  }

  return (
    <div className="animated-fade-in calibration-page">
      <div className="calibration-header">
        <div>
          <h2 className="calibration-title">
            Ajustes de Impresión — Cheque LX-350
          </h2>
          <p className="calibration-subtitle">
            Calibra los offsets de posición para cada campo del cheque físico
          </p>
        </div>
        <div className="calibration-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowResetModal(true)}
            disabled={loading}
          >
            <RotateCcw size={15} />
            Restablecer Offsets
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
            id="btn-guardar-config"
          >
            <Save size={15} />
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      <div className="calibration-grid">
        <div className="calibration-sidebar">
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon">
                <Printer size={17} />
              </div>
              <div>
                <div className="card-title">Dispositivo de Impresión</div>
                <div className="card-subtitle">
                  Impresora activa del sistema Windows
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="select-impresora">Impresora Activa</label>
                <select
                  id="select-impresora"
                  value={settings.printer_name}
                  onChange={(e) =>
                    setSettings({ ...settings, printer_name: e.target.value })
                  }
                >
                  <option value="">-- Seleccionar Impresora --</option>
                  {printers.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                      {p.isDefault ? " ★ (Predeterminada)" : ""}
                    </option>
                  ))}
                </select>
                <span className="calibration-field-hint">
                  Impresoras detectadas por Windows en esta máquina.
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-icon">
                <Sliders size={17} />
              </div>
              <div>
                <div className="card-title">Tamaño de Letra Global</div>
                <div className="card-subtitle">
                  Solo aplica al cheque impreso (no afecta la Orden de Pago)
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="form-group calibration-form-group-last">
                <label htmlFor="select-fuente">Tamaño de Fuente (puntos)</label>
                <div className="calibration-font-row">
                  <select
                    id="select-fuente"
                    value={settings.fuente_tamano}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fuente_tamano: parseInt(e.target.value),
                      })
                    }
                    className="calibration-font-select"
                  >
                    {FONT_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s} pt
                      </option>
                    ))}
                  </select>
                  <div
                    className="calibration-font-preview"
                    style={{
                      fontSize: `${Math.min(settings.fuente_tamano, 18)}px`,
                    }}
                  >
                    Aa
                  </div>
                </div>
              </div>

              <div className="calibration-range-wrap">
                <input
                  type="range"
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  step="1"
                  value={settings.fuente_tamano}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fuente_tamano: parseInt(e.target.value),
                    })
                  }
                  className="calibration-range"
                />
                <div className="calibration-range-labels">
                  <span>8 pt (pequeño)</span>
                  <span>20 pt (grande)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-info calibration-alert-last">
            <Info size={15} />
            <div className="calibration-info-text">
              Los offsets del cheque se miden en <strong>columnas (X)</strong> y{" "}
              <strong>líneas de papel (Y)</strong> para impresión ESC/P en la
              LX-350.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <Sliders size={17} />
            </div>
            <div>
              <div className="card-title">
                Calibración de Campos — Cheque 8.5&quot; × 6&quot;
              </div>
              <div className="card-subtitle">
                Use los controles +/− para ajustar píxeles o caracteres de
                desplazamiento
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="calibration-offset-grid">
              <OffsetCard
                number="F"
                fieldName="Lugar y Fecha"
                xKey="offset_cheque_fecha_x"
                yKey="offset_cheque_fecha_y"
                settings={settings}
                onChange={setSettings}
              />
              <OffsetCard
                number="N"
                fieldName="Nombre / Beneficiario"
                xKey="offset_cheque_beneficiario_x"
                yKey="offset_cheque_beneficiario_y"
                settings={settings}
                onChange={setSettings}
              />
              <OffsetCard
                number="L"
                fieldName="Cantidad en Letras"
                xKey="offset_cheque_letras_x"
                yKey="offset_cheque_letras_y"
                settings={settings}
                onChange={setSettings}
              />
              <OffsetCard
                number="M"
                fieldName="Monto en Números (L.)"
                xKey="offset_cheque_monto_x"
                yKey="offset_cheque_monto_y"
                settings={settings}
                onChange={setSettings}
              />
            </div>

            <div className="calibration-summary">
              <div className="calibration-summary-title">
                Resumen de Offsets Actuales
              </div>
              <div className="calibration-summary-grid">
                {OFFSET_SUMMARY.map((f) => {
                  const x = settings[f.xKey]
                  const y = settings[f.yKey]
                  const hasOffset = x !== 0 || y !== 0
                  return (
                    <div key={f.label} className="calibration-summary-item">
                      <div className="calibration-summary-label">{f.label}</div>
                      <div
                        className={`calibration-summary-values${hasOffset ? " active" : ""}`}
                      >
                        X: {x >= 0 ? "+" : ""}
                        {x} &nbsp; Y: {y >= 0 ? "+" : ""}
                        {y}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showResetModal}
        title="Restablecer Offsets"
        message="¿Restablecer todos los offsets del cheque a cero (0)? Esta acción afectará la calibración de fecha, beneficiario, letras y monto."
        confirmLabel="Sí, restablecer"
        cancelLabel="Cancelar"
        variant="warning"
        icon="reset"
        onConfirm={handleConfirmReset}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  )
}
