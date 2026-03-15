import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldAlert } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string | undefined

  return (
    <div className="flex min-h-screen flex-col bg-bg-main text-text-main">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Bar Area Placeholder */}
      <div className="absolute w-full top-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-bg-card border border-border-subtle flex items-center justify-center shadow-[0_0_10px_rgba(106,191,48,0.1)]">
            <span className="text-brand-accent font-bold text-xs">V</span>
          </div>
          <span className="font-bold tracking-widest text-sm text-text-main">VIKR<span className="text-brand-accent">HUB</span></span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="text-center mb-10 space-y-2">
          <div className="flex justify-center mb-6">
            <div className="bg-bg-card border border-border-subtle p-4 rounded-xl shadow-[0_0_15px_rgba(106,191,48,0.1)]">
              <ShieldAlert className="h-8 w-8 text-brand-accent" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">Authenticate</h1>
          <p className="text-xs sm:text-sm text-[#8F9BB3] font-medium tracking-widest uppercase">Verify your credentials to proceed</p>
        </div>

        <div className="w-full max-w-[400px] bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form className="space-y-6">
            {error && (
              <div className="p-3 text-xs font-bold text-[#FF4C4C] bg-[#FF4C4C]/10 border border-[#FF4C4C]/20 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-[#8F9BB3] font-bold">Partner Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                className="bg-bg-main border-border-subtle text-text-main focus-visible:ring-[#6abf30] focus-visible:border-brand-accent h-12 text-sm placeholder:text-text-meta outline-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-[#8F9BB3] font-bold">Passkey</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter verified password"
                required
                className="bg-bg-main border-border-subtle text-text-main focus-visible:ring-[#6abf30] focus-visible:border-brand-accent h-12 text-sm placeholder:text-text-meta outline-none"
              />
            </div>

            <Button
              formAction={login}
              className="w-full gap-2 bg-brand-accent hover:bg-[#5aab28] text-[#0a2004] font-bold text-sm h-12 rounded-lg mt-4 shadow-[0_0_15px_rgba(106,191,48,0.2)] hover:shadow-[0_0_20px_rgba(106,191,48,0.35)] transition-all border border-brand-accent/50"
            >
              VERIFY NOW
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

