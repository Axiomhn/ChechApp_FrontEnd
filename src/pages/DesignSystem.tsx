import { Button } from "@/components/ui/button"

export default function DesignSystemPage() {
  const colors = {
    Azules: ["bg-blue-50", "bg-blue-100", "bg-blue-200", "bg-blue-600", "bg-blue-700", "bg-blue-900"],
    Verdes: ["bg-green-50", "bg-green-600", "bg-green-700"],
    Rojos: ["bg-red-600", "bg-red-700", "bg-red-800"],
    Grises: ["bg-gray-50", "bg-gray-500", "bg-gray-600", "bg-gray-950"],
    Beige: ["bg-beige-50"],
    Naranja: ["bg-orange-600", "bg-orange-700", "bg-orange-800"],
  }

  return (
    <div className="min-h-screen bg-background p-8 font-sans text-foreground">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Design System</h1>
          <p className="text-muted-foreground">Paleta de colores personalizada para Chech App</p>
        </div>
        <div className="flex gap-4">
          <Button variant="default">Botón Primario</Button>
          <Button variant="secondary">Botón Secundario</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="destructive">Destructivo</Button>
        </div>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(colors).map(([name, shades]) => (
          <section key={name} className="space-y-3 rounded-xl border p-4 shadow-sm">
            <h2 className="text-lg font-semibold capitalize">{name}</h2>
            <div className="flex flex-wrap gap-2">
              {shades.map((shade) => (
                <div key={shade} className="group relative">
                  <div className={`h-16 w-16 rounded-lg shadow-inner ${shade} border border-border transition-transform hover:scale-105`} />
                  <span className="mt-1 block text-center text-[10px] text-muted-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100 italic">
                    {shade.replace("bg-", "")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 space-y-4 rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-sm border border-blue-100">
        <h2 className="text-xl font-bold">Semántica de Componentes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-background p-4 border border-border">
            <h3 className="font-semibold text-foreground">Acento Visual</h3>
            <p className="text-sm text-muted-foreground">Usa primary para acciones principales y secondary para fondos suaves.</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
            <h3 className="font-semibold text-destructive">Estados de Error</h3>
            <p className="text-sm text-destructive/80">Usa destructive para alertas y acciones irreversibles.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
