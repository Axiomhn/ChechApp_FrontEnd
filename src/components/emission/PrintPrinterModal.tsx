import { useEffect, useState } from "react"
import { AlertCircle, Printer } from "lucide-react"
import { getAppApi } from "@/lib/app-api"
import type { PrinterInfo } from "@/types/calibration"

export type PrintDocumentKind = "ORDEN" | "CHEQUE"

interface PrintPrinterModalProps {
  open: boolean
  documentKind: PrintDocumentKind | null
  sessionKey: number
  loading?: boolean
  error?: string
  onConfirm: (printerName: string) => void
  onClose: () => void
}

const DOCUMENT_LABELS: Record<PrintDocumentKind, string> = {
  ORDEN: "Orden de Pago",
  CHEQUE: "Cheque",
}

const DOCUMENT_HINTS: Record<PrintDocumentKind, string> = {
  ORDEN: "Impresión gráfica (HTML → driver Windows). Compatible con inkjet o láser.",
  CHEQUE: "Impresión nativa ESC/P (RAW). Use impresora matricial Epson LX-350.",
}

interface PrintPrinterModalBodyProps {
  documentKind: PrintDocumentKind
  loading: boolean
  error: string
  onConfirm: (printerName: string) => void
  onClose: () => void
}

function PrintPrinterModalBody({
  documentKind,
  loading,
  error,
  onConfirm,
  onClose,
}: PrintPrinterModalBodyProps) {
  const [printers, setPrinters] = useState<PrinterInfo[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState("")
  const [loadingPrinters, setLoadingPrinters] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let active = true

    getAppApi()
      .config.getPrinters()
      .then((list) => {
        if (!active) return
        const printerList = list || []
        setPrinters(printerList)
        const defaultPrinter =
          printerList.find((p) => p.isDefault)?.name || printerList[0]?.name || ""
        setSelectedPrinter(defaultPrinter)
        if (!printerList.length) {
          setLoadError("No se detectaron impresoras en Windows.")
        }
      })
      .catch(() => {
        if (!active) return
        setLoadError("No se pudo obtener la lista de impresoras.")
      })
      .finally(() => {
        if (active) setLoadingPrinters(false)
      })

    return () => {
      active = false
    }
  }, [])

  const canPrint = Boolean(selectedPrinter.trim()) && !loadingPrinters && !loading

  return (
    <div className="modal-box print-printer-modal" role="dialog" aria-modal="true">
      <div className="modal-header">
        <div className="confirm-modal-header-content">
          <div className="confirm-modal-icon confirm-modal-icon-default">
            <Printer size={20} />
          </div>
          <h3 className="modal-title">Seleccionar impresora</h3>
        </div>
      </div>

      <div className="modal-body">
        <p className="print-printer-modal-doc">
          Imprimir <strong>{DOCUMENT_LABELS[documentKind]}</strong>
        </p>
        <p className="print-printer-modal-hint">{DOCUMENT_HINTS[documentKind]}</p>

        <div className="form-group print-printer-modal-field">
          <label htmlFor="print-printer-select">Impresora</label>
          <select
            id="print-printer-select"
            value={selectedPrinter}
            onChange={(e) => setSelectedPrinter(e.target.value)}
            disabled={loadingPrinters || loading || printers.length === 0}
          >
            {loadingPrinters ? (
              <option value="">Cargando impresoras...</option>
            ) : printers.length === 0 ? (
              <option value="">Sin impresoras disponibles</option>
            ) : (
              printers.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                  {p.isDefault ? " ★ (Predeterminada)" : ""}
                </option>
              ))
            )}
          </select>
        </div>

        {loadError && (
          <div className="alert alert-danger print-printer-modal-alert">
            <AlertCircle size={15} />
            <span>{loadError}</span>
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger print-printer-modal-alert"
            role="alert"
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onConfirm(selectedPrinter.trim())}
          disabled={!canPrint}
        >
          {loading ? "Imprimiendo..." : "Imprimir"}
        </button>
      </div>
    </div>
  )
}

export default function PrintPrinterModal({
  open,
  documentKind,
  sessionKey,
  loading = false,
  error = "",
  onConfirm,
  onClose,
}: PrintPrinterModalProps) {
  if (!open || !documentKind) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <PrintPrinterModalBody
        key={sessionKey}
        documentKind={documentKind}
        loading={loading}
        error={error}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </div>
  )
}
