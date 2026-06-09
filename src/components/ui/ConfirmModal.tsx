import { AlertTriangle, LogOut, RotateCcw } from "lucide-react"

type ConfirmModalVariant = "default" | "danger" | "warning"

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmModalVariant
  loading?: boolean
  icon?: "logout" | "reset" | "warning"
  onConfirm: () => void
  onClose: () => void
}

const iconMap = {
  logout: LogOut,
  reset: RotateCcw,
  warning: AlertTriangle,
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  icon = "warning",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null

  const Icon = iconMap[icon]
  const confirmClass =
    variant === "danger"
      ? "btn btn-danger"
      : variant === "warning"
        ? "btn btn-primary"
        : "btn btn-primary"

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div className="modal-box confirm-modal-box" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="confirm-modal-header-content">
            <div className={`confirm-modal-icon confirm-modal-icon-${variant}`}>
              <Icon size={20} />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
        </div>

        <div className="modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
