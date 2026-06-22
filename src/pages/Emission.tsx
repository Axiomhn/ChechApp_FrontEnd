import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  Calendar,
  User,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  CreditCard,
  X,
} from "lucide-react"
import { useProvidersQuery } from "@/api/providers"
import {
  formatMontoInputWhileTyping,
  formatMontoNumber,
  parseMontoInput,
} from "@/lib/monto-format"
import { numberToLetters } from "@/lib/numberToLetters"
import { getAppApi } from "@/lib/app-api"
import type { AppSettings } from "@/types/electron"
import type { Provider } from "@/types/provider"
import {
  createEmptyDescripciones,
  createEmptyEstructura,
  DESCRIPCION_MAX_LENGTH,
  DETALLE_GASTO_MAX_LENGTH,
} from "@/types/emission"

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

const PROVIDER_SEARCH_LIMIT = 50

export default function EmissionPage() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [providerQuery, setProviderQuery] = useState("")
  const [debouncedProviderQuery, setDebouncedProviderQuery] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [fecha, setFecha] = useState(generateDefaultDate)
  const [monto, setMonto] = useState("")
  const [montoLetras, setMontoLetras] = useState("")
  const [descripciones, setDescripciones] = useState(createEmptyDescripciones)
  const [estructura, setEstructura] = useState(createEmptyEstructura)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [printSuccess, setPrintSuccess] = useState("")
  const [printError, setPrintError] = useState("")
  const [printing, setPrinting] = useState(false)
  const [printingType, setPrintingType] = useState("")

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data: providersData, isFetching: loadingProviders } = useProvidersQuery(
    1,
    PROVIDER_SEARCH_LIMIT,
    debouncedProviderQuery
  )
  const providers = providersData?.items ?? []

  useEffect(() => {
    let active = true
    getAppApi()
      .config.getSettings()
      .then((setRes) => {
        if (!active) return
        if (setRes.success && setRes.data) setSettings(setRes.data)
      })
      .catch((err) => console.error(err))

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedProviderQuery(providerQuery.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [providerQuery])

  useEffect(() => {
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
    const formatted = formatMontoInputWhileTyping(e.target.value)
    setMonto(formatted)
    const numeric = parseMontoInput(formatted)
    if (numeric !== null && numeric >= 0) {
      setMontoLetras(numberToLetters(numeric))
    } else {
      setMontoLetras("")
    }
  }

  const handleProviderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProviderQuery(e.target.value)
    setShowDropdown(true)
  }

  const selectProvider = (prov: Provider) => {
    setSelectedProvider(prov)
    setProviderQuery("")
    setShowDropdown(false)
  }

  const clearSelectedProvider = () => {
    setSelectedProvider(null)
    setProviderQuery("")
    setShowDropdown(false)
    searchInputRef.current?.focus()
  }

  const montoNumerico = parseMontoInput(monto)

  const isChequeFormComplete =
    fecha.trim() !== "" &&
    selectedProvider !== null &&
    montoNumerico !== null &&
    montoNumerico > 0 &&
    montoLetras.trim() !== ""

  const validateChequeForm = () => {
    if (!selectedProvider) {
      setPrintError(
        "Debe seleccionar un proveedor del catálogo. Si no aparece, regístrelo en Catálogo de Proveedores."
      )
      return false
    }
    if (!fecha.trim()) {
      setPrintError("Ingrese el lugar y la fecha del comprobante.")
      return false
    }
    if (montoNumerico === null || montoNumerico <= 0) {
      setPrintError("Ingrese un monto numérico válido mayor a cero.")
      return false
    }
    if (!montoLetras.trim()) {
      setPrintError("El monto en letras no pudo generarse. Verifique el monto ingresado.")
      return false
    }
    return true
  }

  const handleDescripcionChange = (index: number, value: string) => {
    const trimmed = value.slice(0, DESCRIPCION_MAX_LENGTH)
    setDescripciones((prev) => {
      const next = [...prev]
      next[index] = trimmed
      return next
    })
  }

  const handleEstructuraDetalleChange = (index: number, value: string) => {
    const trimmed = value.slice(0, DETALLE_GASTO_MAX_LENGTH)
    setEstructura((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], detalle: trimmed }
      return next
    })
  }

  const handleEstructuraSubTotalChange = (index: number, value: string) => {
    setEstructura((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        subTotal: formatMontoInputWhileTyping(value),
      }
      return next
    })
  }

  const buildPrintPayload = () => ({
    fecha,
    beneficiario,
    monto: formatMontoNumber(montoNumerico!),
    montoLetras,
    descripciones: descripciones.map((row) => row.trim()),
    estructura: estructura.map((row) => ({
      detalle: row.detalle.trim(),
      subTotal: row.subTotal.trim(),
    })),
  })

  const beneficiario = selectedProvider?.nombre_razon ?? ""

  const handlePrintOrden = async () => {
    if (!validateChequeForm()) return

    setPrinting(true)
    setPrintingType("ORDEN")
    setPrintError("")
    setPrintSuccess("")

    try {
      const api = getAppApi()
      const configRes = await api.config.getSettings()
      const cfg = configRes.success ? configRes.data : settings
      const printerName = cfg?.printer_name || "Microsoft Print to PDF"

      const payload = buildPrintPayload()

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

      // Orden de pago usa plantilla HTML completa → impresión gráfica
      const result = await api.print.graphical(
        "ORDEN_PAGO",
        payload,
        offsets
      )

      if (result.success) {
        setPrintSuccess(
          `Orden de Pago enviada a "${printerName}" correctamente.`
        )
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
    if (!validateChequeForm()) return

    setPrinting(true)
    setPrintingType("CHEQUE")
    setPrintError("")
    setPrintSuccess("")

    try {
      const api = getAppApi()
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

      const payload = buildPrintPayload()

      const printMethod = cfg?.print_method || "native"
      const result =
        printMethod === "native"
          ? await api.print.nativeEscP(printerName, "CHEQUE", payload, offsets)
          : await api.print.graphical("CHEQUE", payload, offsets)

      if (result.success) {
        setPrintSuccess(
          `Cheque enviado a "${printerName}" (Epson LX-350) correctamente.`
        )
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

              {selectedProvider ? (
                <div className="emission-provider-selected">
                  <User size={16} />
                  <div className="emission-provider-selected-text">
                    <span className="emission-provider-selected-label">
                      Beneficiario seleccionado
                    </span>
                    <span className="emission-provider-selected-name">
                      {selectedProvider.nombre_razon}
                    </span>
                    {(selectedProvider.rtn || selectedProvider.telefono) && (
                      <span className="emission-provider-selected-meta">
                        {selectedProvider.rtn
                          ? `RTN: ${selectedProvider.rtn}`
                          : ""}
                        {selectedProvider.rtn && selectedProvider.telefono
                          ? " · "
                          : ""}
                        {selectedProvider.telefono
                          ? `Tel: ${selectedProvider.telefono}`
                          : ""}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm emission-provider-change-btn"
                    onClick={clearSelectedProvider}
                  >
                    <X size={14} />
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <Search size={16} />
                    </span>
                    <input
                      ref={searchInputRef}
                      id="proveedor"
                      type="text"
                      className="has-icon"
                      value={providerQuery}
                      onChange={handleProviderInput}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Buscar por nombre o RTN en el catálogo..."
                      autoComplete="off"
                    />
                  </div>
                  <span className="calibration-field-hint">
                    Solo puede imprimir proveedores registrados. Si no lo
                    encuentra,{" "}
                    <Link to="/providers">agréguelo en Catálogo de Proveedores</Link>.
                  </span>

                  {showDropdown && (
                    <ul className="autocomplete-dropdown">
                      {loadingProviders ? (
                        <li className="autocomplete-empty">
                          Buscando proveedores...
                        </li>
                      ) : providers.length > 0 ? (
                        providers.map((p) => (
                          <li
                            key={p.id}
                            className="autocomplete-item"
                            onMouseDown={() => selectProvider(p)}
                          >
                            <div className="autocomplete-item-name">
                              {p.nombre_razon}
                            </div>
                            <div className="autocomplete-item-meta">
                              RTN: {p.rtn || "No registrado"}
                              &nbsp;&nbsp;|&nbsp;&nbsp;Tel:{" "}
                              {p.telefono || "Sin teléfono"}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="autocomplete-empty">
                          No se encontraron proveedores.
                          {providerQuery.trim() ? (
                            <>
                              {" "}
                              <Link to="/providers">
                                Regístrelo en Catálogo de Proveedores
                              </Link>
                              .
                            </>
                          ) : (
                            " El catálogo está vacío."
                          )}
                        </li>
                      )}
                    </ul>
                  )}
                </>
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
                  type="text"
                  inputMode="decimal"
                  value={monto}
                  onChange={handleMontoChange}
                  placeholder="0.00"
                  className="input-monto"
                  autoComplete="off"
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

            <div className="emission-tables-section">
              <div className="emission-tables-heading">
                <FileText size={15} />
                <span>Detalle del egreso (Orden de Pago)</span>
              </div>
              <p className="emission-tables-hint">
                Campos opcionales para la Orden de Pago. Puede dejar filas en
                blanco si no aplican.
              </p>

              <div className="emission-table-block">
                <h4 className="emission-table-title">Descripción</h4>
                <div className="emission-descripcion-list">
                  {descripciones.map((row, index) => (
                    <div key={`desc-${index}`} className="emission-descripcion-row">
                      <label htmlFor={`descripcion-${index}`}>
                        Fila {index + 1}
                      </label>
                      <input
                        id={`descripcion-${index}`}
                        type="text"
                        value={row}
                        maxLength={DESCRIPCION_MAX_LENGTH}
                        onChange={(e) =>
                          handleDescripcionChange(index, e.target.value)
                        }
                        placeholder={`Descripción fila ${index + 1}`}
                        autoComplete="off"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="emission-table-block">
                <h4 className="emission-table-title">Estructura</h4>
                <div className="emission-estructura-table-wrap">
                  <table className="emission-estructura-table">
                    <thead>
                      <tr>
                        <th>Detalle objeto de gasto (opcional)</th>
                        <th>Sub-total (opcional)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estructura.map((row, index) => (
                        <tr key={`est-${index}`}>
                          <td>
                            <input
                              id={`estructura-detalle-${index}`}
                              type="text"
                              value={row.detalle}
                              maxLength={DETALLE_GASTO_MAX_LENGTH}
                              onChange={(e) =>
                                handleEstructuraDetalleChange(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder={`Detalle fila ${index + 1}`}
                              autoComplete="off"
                            />
                          </td>
                          <td>
                            <input
                              id={`estructura-subtotal-${index}`}
                              type="text"
                              inputMode="decimal"
                              value={row.subTotal}
                              onChange={(e) =>
                                handleEstructuraSubTotalChange(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              autoComplete="off"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  disabled={printing || !isChequeFormComplete}
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
                  disabled={printing || !isChequeFormComplete}
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
