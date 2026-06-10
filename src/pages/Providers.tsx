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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { AxiosError } from "axios"
import {
  useCreateProviderMutation,
  useDeleteProviderMutation,
  useProvidersQuery,
  useUpdateProviderMutation,
} from "@/api/providers"
import type { Provider } from "@/types/provider"
import {
  DEFAULT_PROVIDER_PAGE_SIZE,
  PROVIDER_PAGE_SIZE_OPTIONS,
} from "@/types/provider"

interface ProviderForm {
  id: string | null
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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_PROVIDER_PAGE_SIZE)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProvider, setCurrentProvider] =
    useState<ProviderForm>(emptyProvider())
  const [error, setError] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const { data, isLoading, isFetching } = useProvidersQuery(
    page,
    limit,
    debouncedSearch
  )
  const createMutation = useCreateProviderMutation()
  const updateMutation = useUpdateProviderMutation()
  const deleteMutation = useDeleteProviderMutation()

  const providers = data?.items ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1
  const saving = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const currentPage = pagination?.page ?? page

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

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string; code?: string }>
    return axiosErr.response?.data?.message ?? fallback
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProvider.nombre_razon.trim()) {
      setError("El Nombre o Razón Social es requerido.")
      return
    }

    setError("")
    const payload = {
      nombre_razon: currentProvider.nombre_razon,
      rtn: currentProvider.rtn,
      telefono: currentProvider.telefono,
    }

    try {
      if (currentProvider.id) {
        await updateMutation.mutateAsync({ id: currentProvider.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      setIsModalOpen(false)
    } catch (err) {
      const axiosErr = err as AxiosError<{ code?: string; message?: string }>
      if (axiosErr.response?.data?.code === "UNIQUE_VIOLATION") {
        setError("Ya existe un proveedor con este Nombre/Razón Social.")
      } else {
        setError(getApiErrorMessage(err, "Error al guardar el proveedor."))
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      setDeleteConfirmId(null)
      if (providers.length === 1 && page > 1) {
        setPage((prev) => prev - 1)
      }
    } catch (err) {
      alert(
        "No se pudo eliminar el proveedor: " +
          getApiErrorMessage(err, "Error desconocido")
      )
    }
  }

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1
  const rangeEnd = Math.min(currentPage * limit, total)
  const showPagination = total > limit

  return (
    <div className="animated-fade-in providers-page">
      <div className="providers-header">
        <div>
          <h2 className="providers-title">Catálogo de Proveedores</h2>
          <p className="providers-count">
            {total} proveedor{total !== 1 ? "es" : ""} registrado
            {total !== 1 ? "s" : ""}
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
            {total} resultado{total !== 1 ? "s" : ""}
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
            {isLoading ? (
              <tr>
                <td colSpan={5} className="providers-empty-row">
                  Cargando proveedores...
                </td>
              </tr>
            ) : providers.length > 0 ? (
              providers.map((p, index) => (
                <tr key={p.id}>
                  <td>
                    <span className="badge badge-sky">
                      #{(currentPage - 1) * limit + index + 1}
                    </span>
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
                            disabled={deleteMutation.isPending}
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

      <div className="providers-pagination">
        <div className="providers-pagination-info">
          <label htmlFor="providers-page-size" className="providers-page-size-label">
            Mostrar
          </label>
          <span className="providers-page-size-wrap">
            <select
              id="providers-page-size"
              className="providers-page-size-select"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
            >
              {PROVIDER_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </span>
          <span className="providers-page-size-label">por página</span>
          {total > 0 && (
            <span className="providers-pagination-range">
              {rangeStart}–{rangeEnd} de {total}
              {isFetching && !isLoading ? " · actualizando..." : ""}
            </span>
          )}
        </div>

        {showPagination && (
          <div className="providers-pagination-controls">
            <span className="providers-pagination-page">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              className="providers-page-btn"
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1 || isFetching}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <button
              type="button"
              className="providers-page-btn"
              onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage >= totalPages || isFetching}
              aria-label="Página siguiente"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        )}
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
                      disabled={saving}
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
                      disabled={saving}
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
                      disabled={saving}
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
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-proveedor"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
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
