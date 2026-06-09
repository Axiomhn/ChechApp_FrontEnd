import { useEffect, useState } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  AlertCircle,
  Phone,
  FileText,
  Users,
} from "lucide-react"
import { getAppApi } from "@/lib/app-api"
import type { Provider } from "@/types/electron"

interface ProviderForm {
  id: number | null
  nombre_razon: string
  rtn: string
  telefono: string
}

const emptyProvider = (): ProviderForm => ({
  id: null,
  nombre_razon: "",
  rtn: "",
  telefono: "",
})

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProvider, setCurrentProvider] =
    useState<ProviderForm>(emptyProvider())
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const api = getAppApi()

  const loadProviders = async () => {
    try {
      const res = await api.db.getProviders()
      if (res.success && res.data) setProviders(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [])

  const filteredProviders = providers.filter(
    (p) =>
      p.nombre_razon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.rtn && p.rtn.includes(searchTerm))
  )

  const handleOpenModal = (provider?: Provider) => {
    setCurrentProvider(
      provider
        ? {
            id: provider.id,
            nombre_razon: provider.nombre_razon,
            rtn: provider.rtn ?? "",
            telefono: provider.telefono ?? "",
          }
        : emptyProvider()
    )
    setError("")
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProvider.nombre_razon.trim()) {
      setError("El Nombre o Razón Social es requerido.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await api.db.saveProvider(currentProvider)
      if (res.success) {
        await loadProviders()
        setIsModalOpen(false)
      } else if (res.error?.includes("UNIQUE")) {
        setError("Ya existe un proveedor con este Nombre/Razón Social.")
      } else {
        setError(res.error || "Error al guardar el proveedor.")
      }
    } catch {
      setError("Fallo de conexión con la base de datos local.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await api.db.deleteProvider(id)
      if (res.success) {
        setDeleteConfirmId(null)
        await loadProviders()
      } else {
        alert("No se pudo eliminar el proveedor: " + res.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="animated-fade-in providers-page">
      <div className="providers-header">
        <div>
          <h2 className="providers-title">Catálogo de Proveedores</h2>
          <p className="providers-count">
            {providers.length} proveedor{providers.length !== 1 ? "es" : ""}{" "}
            registrado{providers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          id="btn-nuevo-proveedor"
        >
          <Plus size={16} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="card providers-search-card">
        <div className="providers-search-bar">
          <div className="input-wrapper providers-search-input">
            <span className="input-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="has-icon"
              placeholder="Buscar por nombre, razón social o RTN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="buscador-proveedores"
            />
          </div>
          <span className="badge badge-navy">
            <Users size={12} style={{ marginRight: "4px" }} />
            {filteredProviders.length} resultado
            {filteredProviders.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: "60px" }}>#</th>
              <th>Nombre / Razón Social</th>
              <th>RTN (Identif. Fiscal)</th>
              <th>Teléfono</th>
              <th style={{ width: "110px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.length > 0 ? (
              filteredProviders.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="badge badge-sky">#{p.id}</span>
                  </td>
                  <td className="providers-name-cell">{p.nombre_razon}</td>
                  <td>
                    {p.rtn ? (
                      <span className="font-mono">{p.rtn}</span>
                    ) : (
                      <span className="text-muted providers-empty-cell">
                        No registrado
                      </span>
                    )}
                  </td>
                  <td>
                    {p.telefono ? (
                      <span>{p.telefono}</span>
                    ) : (
                      <span className="text-muted providers-empty-cell">
                        Sin teléfono
                      </span>
                    )}
                  </td>
                  <td className="providers-actions-cell">
                    <div className="providers-actions">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(p)}
                        title="Editar proveedor"
                        className="providers-icon-btn providers-icon-btn-edit"
                      >
                        <Edit2 size={15} />
                      </button>

                      {deleteConfirmId === p.id ? (
                        <div className="providers-delete-confirm">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p.id)}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          title="Eliminar proveedor"
                          className="providers-icon-btn providers-icon-btn-delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="providers-empty-row">
                  <Users size={32} className="providers-empty-icon" />
                  No se encontraron proveedores que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">
                {currentProvider.id
                  ? "Editar Proveedor"
                  : "Registrar Nuevo Proveedor"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <form id="form-proveedor" onSubmit={handleSave}>
                <div className="form-group">
                  <label>
                    Nombre / Razón Social{" "}
                    <span className="providers-required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <FileText size={16} />
                    </span>
                    <input
                      type="text"
                      className="has-icon"
                      value={currentProvider.nombre_razon}
                      onChange={(e) =>
                        setCurrentProvider({
                          ...currentProvider,
                          nombre_razon: e.target.value,
                        })
                      }
                      placeholder="Ej. Distribuidora del Norte S.A."
                      disabled={loading}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>RTN (Registro Tributario Nacional)</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <FileText size={16} />
                    </span>
                    <input
                      type="text"
                      className="has-icon"
                      value={currentProvider.rtn}
                      onChange={(e) =>
                        setCurrentProvider({
                          ...currentProvider,
                          rtn: e.target.value,
                        })
                      }
                      placeholder="Ej. 08011990123456 (14 dígitos)"
                      disabled={loading}
                      maxLength={20}
                    />
                  </div>
                  <span className="providers-field-hint">
                    Registro Tributario Nacional de Honduras — 14 dígitos
                  </span>
                </div>

                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      className="has-icon"
                      value={currentProvider.telefono}
                      onChange={(e) =>
                        setCurrentProvider({
                          ...currentProvider,
                          telefono: e.target.value,
                        })
                      }
                      placeholder="Ej. 2234-5678"
                      disabled={loading}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-proveedor"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : currentProvider.id
                    ? "Guardar Cambios"
                    : "Registrar Proveedor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
