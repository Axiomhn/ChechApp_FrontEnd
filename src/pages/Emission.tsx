import { useEffect, useRef, useState } from "react"
import {
  Calendar,
  User,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  CreditCard,
} from "lucide-react"
import { numberToLetters } from "@/lib/numberToLetters"
import { getAppApi } from "@/lib/app-api"
import type { AppSettings, Provider } from "@/types/electron"

function generateDefaultDate() {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]
  const d = new Date()
  const dia = d.getDate().toString().padStart(2, "0")
  const mes = meses[d.getMonth()]
  const anio = d.getFullYear()
  return `El Negrito, Yoro, ${dia} de ${mes} de ${anio}`
}

export default function EmissionPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchProvider, setSearchProvider] = useState("")
  const [fecha, setFecha] = useState("")
  const [monto, setMonto] = useState("")
  const [montoLetras, setMontoLetras] = useState("")
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [printSuccess, setPrintSuccess] = useState("")
  const [printError, setPrintError] = useState("")
  const [printing, setPrinting] = useState(false)
  const [printingType, setPrintingType] = useState("")

  const dropdownRef = useRef<HTMLDivElement>(null)
  const api = getAppApi()

  const loadData = async () => {
    try {
      const provRes = await api.db.getProviders()
      if (provRes.success && provRes.data) setProviders(provRes.data)

      const setRes = await api.config.getSettings()
      if (setRes.success && setRes.data) setSettings(setRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setFecha(generateDefaultDate())
    loadData()

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMonto(val)
    if (val && !isNaN(Number(val)) && parseFloat(val) >= 0) {
      setMontoLetras(numberToLetters(val))
    } else {
      setMontoLetras("")
    }
  }

  const handleProviderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchProvider(e.target.value)
    setShowDropdown(true)
  }

  const selectProvider = (prov: Provider) => {
    setSearchProvider(prov.nombre_razon)
    setShowDropdown(false)
  }

  const filteredProviders = providers.filter(
    (p) =>
      p.nombre_razon.toLowerCase().includes(searchProvider.toLowerCase()) ||
      (p.rtn && p.rtn.toLowerCase().includes(searchProvider.toLowerCase()))
  )

  const validateForm = () => {
    if (!searchProvider.trim()) {
      setPrintError("Debe seleccionar o escribir un Beneficiario.")
      return false
    }
    if (!monto || isNaN(Number(monto)) || parseFloat(monto) <= 0) {
      setPrintError("Ingrese un monto numérico válido mayor a cero.")
      return false
    }
    return true
  }

  const resetForm = () => {
    setMonto("")
    setMontoLetras("")
    setSearchProvider("")
    loadData()
  }

  const handlePrintOrden = async () => {
    if (!validateForm()) return

    setPrinting(true)
    setPrintingType("ORDEN")
    setPrintError("")
    setPrintSuccess("")

    try {
      const configRes = await api.config.getSettings()
      const cfg = configRes.success ? configRes.data : settings
      const printerName = cfg?.printer_name || "Microsoft Print to PDF"

      const payload = {
        fecha,
        beneficiario: searchProvider,
        monto: parseFloat(monto).toFixed(2),
        montoLetras,
      }

      const offsets = {
        fecha_x: 0,
        fecha_y: 0,
        monto_x: 0,
        monto_y: 0,
        beneficiario_x: 0,
        beneficiario_y: 0,
        letras_x: 0,
        letras_y: 0,
      }

      const printMethod = cfg?.print_method || "graphical"
      const result =
        printMethod === "native"
          ? await api.print.nativeEscP(
              printerName,
              "ORDEN_PAGO",
              payload,
              offsets
            )
          : await api.print.graphical("ORDEN_PAGO", payload, offsets)

      if (result.success) {
        setPrintSuccess(
          `Orden de Pago enviada a "${printerName}" correctamente.`
        )
        resetForm()
      } else {
        setPrintError(
          `Error al imprimir Orden de Pago: ${result.error || "Verifique la impresora."}`
        )
      }
    } catch (err) {
      console.error(err)
      setPrintError("Excepción al procesar la impresión de Orden de Pago.")
    } finally {
      setPrinting(false)
      setPrintingType("")
    }
  }

  const handlePrintCheque = async () => {
    if (!validateForm()) return

    setPrinting(true)
    setPrintingType("CHEQUE")
    setPrintError("")
    setPrintSuccess("")

    try {
      const configRes = await api.config.getSettings()
      const cfg = configRes.success ? configRes.data : settings
      const printerName = cfg?.printer_name || "Microsoft Print to PDF"

      const offsets = {
        fecha_x: parseInt(cfg?.offset_cheque_fecha_x || "0"),
        fecha_y: parseInt(cfg?.offset_cheque_fecha_y || "0"),
        monto_x: parseInt(cfg?.offset_cheque_monto_x || "0"),
        monto_y: parseInt(cfg?.offset_cheque_monto_y || "0"),
        beneficiario_x: parseInt(cfg?.offset_cheque_beneficiario_x || "0"),
        beneficiario_y: parseInt(cfg?.offset_cheque_beneficiario_y || "0"),
        letras_x: parseInt(cfg?.offset_cheque_letras_x || "0"),
        letras_y: parseInt(cfg?.offset_cheque_letras_y || "0"),
      }

      const payload = {
        fecha,
        beneficiario: searchProvider,
        monto: parseFloat(monto).toFixed(2),
        montoLetras,
      }

      const printMethod = cfg?.print_method || "graphical"
      const result =
        printMethod === "native"
          ? await api.print.nativeEscP(printerName, "CHEQUE", payload, offsets)
          : await api.print.graphical("CHEQUE", payload, offsets)

      if (result.success) {
        setPrintSuccess(
          `Cheque enviado a "${printerName}" (Epson LX-350) correctamente.`
        )
        resetForm()
      } else {
        setPrintError(
          `Error al imprimir Cheque: ${result.error || "Verifique la impresora LX-350."}`
        )
      }
    } catch (err) {
      console.error(err)
      setPrintError("Excepción al procesar la impresión del Cheque.")
    } finally {
      setPrinting(false)
      setPrintingType("")
    }
  }

  return (
    <div className="animated-fade-in emission-page">
      {printSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span style={{ fontWeight: 600 }}>{printSuccess}</span>
        </div>
      )}
      {printError && (
        <div className="alert alert-danger">
          <AlertCircle size={16} />
          <span style={{ fontWeight: 600 }}>{printError}</span>
        </div>
      )}

      <div className="emission-form">
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon">
              <FileText size={18} />
            </div>
            <div>
              <div className="card-title">Datos del Comprobante</div>
              <div className="card-subtitle">
                Complete los campos y seleccione el tipo de impresión
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="fecha">
                <Calendar
                  size={13}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Lugar y Fecha
              </label>
              <input
                id="fecha"
                type="text"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="El Negrito, Yoro, 01 de Enero de 2026"
              />
            </div>

            <div
              className="form-group autocomplete-container"
              ref={dropdownRef}
            >
              <label htmlFor="proveedor">
                <Search
                  size={13}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Sírvase Pagar a la Orden de (Proveedor / Beneficiario)
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <User size={16} />
                </span>
                <input
                  id="proveedor"
                  type="text"
                  className="has-icon"
                  value={searchProvider}
                  onChange={handleProviderInput}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Escriba nombre o RTN para buscar..."
                  autoComplete="off"
                />
              </div>

              {showDropdown && filteredProviders.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredProviders.map((p) => (
                    <li
                      key={p.id}
                      className="autocomplete-item"
                      onMouseDown={() => selectProvider(p)}
                    >
                      <div className="autocomplete-item-name">
                        {p.nombre_razon}
                      </div>
                      <div className="autocomplete-item-meta">
                        RTN: {p.rtn || "No registrado"}&nbsp;&nbsp;|&nbsp;&nbsp;Tel:{" "}
                        {p.telefono || "Sin teléfono"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="monto">
                <Hash
                  size={13}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Monto en Números (L.)
              </label>
              <div className="input-wrapper">
                <span className="input-icon input-icon-monto">L.</span>
                <input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={monto}
                  onChange={handleMontoChange}
                  placeholder="0.00"
                  className="input-monto"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <FileText
                  size={13}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                Cantidad en Letras (Conversión Automática)
              </label>
              <div className={`readonly-field ${!montoLetras ? "empty" : ""}`}>
                {montoLetras ? (
                  <>
                    <FileText
                      size={15}
                      style={{ color: "var(--sky)", flexShrink: 0 }}
                    />{" "}
                    {montoLetras}
                  </>
                ) : (
                  "Ingrese un monto para ver la conversión en letras"
                )}
              </div>
            </div>

            <div className="emission-print-section">
              <p className="emission-print-hint">
                Seleccione el tipo de documento a imprimir:
              </p>
              <div className="print-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handlePrintOrden}
                  disabled={printing}
                  id="btn-imprimir-orden"
                >
                  <FileText size={17} />
                  {printing && printingType === "ORDEN"
                    ? "Enviando..."
                    : "Imprimir Orden de Pago"}
                </button>

                <button
                  type="button"
                  className="btn btn-sky btn-lg"
                  onClick={handlePrintCheque}
                  disabled={printing}
                  id="btn-imprimir-cheque"
                >
                  <CreditCard size={17} />
                  {printing && printingType === "CHEQUE"
                    ? "Enviando..."
                    : "Imprimir Cheque"}
                </button>
              </div>

              {settings && (
                <p className="emission-printer-info">
                  Impresora activa:{" "}
                  <strong>{settings.printer_name || "No configurada"}</strong>
                  &nbsp;·&nbsp; Motor:{" "}
                  <strong>
                    {settings.print_method === "native"
                      ? "ESC/P Nativo"
                      : "Gráfico Windows"}
                  </strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
