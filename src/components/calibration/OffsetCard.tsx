import type { CalibrationSettings } from "@/types/calibration"

type OffsetKey = keyof Pick<
  CalibrationSettings,
  | "offset_cheque_fecha_x"
  | "offset_cheque_fecha_y"
  | "offset_cheque_monto_x"
  | "offset_cheque_monto_y"
  | "offset_cheque_beneficiario_x"
  | "offset_cheque_beneficiario_y"
  | "offset_cheque_letras_x"
  | "offset_cheque_letras_y"
>

interface OffsetControlProps {
  label: string
  value: number
  onChange: (value: number) => void
}

function OffsetControl({ label, value, onChange }: OffsetControlProps) {
  return (
    <div className="offset-control-group">
      <span className="offset-control-label">{label}</span>
      <div className="offset-control">
        <button
          type="button"
          className="offset-btn"
          onClick={() => onChange(value - 1)}
          title={`Disminuir ${label}`}
        >
          −
        </button>
        <input
          type="number"
          className="offset-value"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        />
        <button
          type="button"
          className="offset-btn"
          onClick={() => onChange(value + 1)}
          title={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

interface OffsetCardProps {
  number: string
  fieldName: string
  xKey: OffsetKey
  yKey: OffsetKey
  settings: CalibrationSettings
  onChange: (settings: CalibrationSettings) => void
}

export default function OffsetCard({
  number,
  fieldName,
  xKey,
  yKey,
  settings,
  onChange,
}: OffsetCardProps) {
  return (
    <div className="offset-card">
      <div className="offset-card-header">
        <div className="offset-card-number">{number}</div>
        <div>
          <div className="offset-card-title">{fieldName}</div>
          <div className="offset-card-subtitle">
            Desplazamiento horizontal y vertical
          </div>
        </div>
      </div>
      <div className="offset-card-controls">
        <OffsetControl
          label="Eje X (←→)"
          value={settings[xKey]}
          onChange={(v) => onChange({ ...settings, [xKey]: v })}
        />
        <OffsetControl
          label="Eje Y (↑↓)"
          value={settings[yKey]}
          onChange={(v) => onChange({ ...settings, [yKey]: v })}
        />
      </div>
    </div>
  )
}
