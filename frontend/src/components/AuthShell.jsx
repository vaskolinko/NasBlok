import { Logo } from './icons.jsx'

const WINDOWS = [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0]

export default function AuthShell({ subtitle, children }) {
  return (
    <div className="min-h-screen bg-page flex">
      <div className="hidden lg:flex flex-1 bg-brand flex-col items-center justify-center gap-8 p-12">
        <div className="flex flex-col items-center" aria-hidden="true">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '130px solid transparent',
              borderRight: '130px solid transparent',
              borderBottom: '40px solid #3E7F72',
            }}
          />
          <div className="w-60 bg-[#2E6E61] p-4 grid grid-cols-4 gap-2.5">
            {WINDOWS.map((lit, i) => (
              <span key={i} className={`h-8 rounded ${lit ? 'bg-accent' : 'bg-brand-dark'}`} />
            ))}
          </div>
          <div className="w-72 h-1.5 bg-[#3E7F72] rounded" />
        </div>
        <p className="text-white/90 text-lg max-w-sm text-center leading-relaxed">
          Okvare, glasovanja in obvestila vaše stavbe na enem mestu.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <div className="text-2xl font-extrabold leading-tight">NašBlok</div>
              <div className="text-muted">{subtitle}</div>
            </div>
          </div>
          <div className="bg-white border border-line rounded-2xl p-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
