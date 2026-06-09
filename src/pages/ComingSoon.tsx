import { Construction } from "lucide-react"

interface ComingSoonProps {
  moduleName: string
}

export default function ComingSoon({ moduleName }: ComingSoonProps) {
  return (
    <div className="animated-fade-in">
      <div className="card">
        <div className="card-body coming-soon-body">
          <Construction size={40} className="coming-soon-icon" />
          <h2 className="coming-soon-title">{moduleName}</h2>
          <p className="coming-soon-text">
            Este módulo se implementará en la siguiente fase de migración desde
            ChequeApp.
          </p>
        </div>
      </div>
    </div>
  )
}
