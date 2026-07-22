import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<"div"> & { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || "Email o password non valide.")
      } else {
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.href = "/dashboard"
        }
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Si è verificato un errore di rete. Riprova.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="bg-transparent border-0 ring-0 outline-none shadow-none text-white">
        <CardHeader className="px-0 pt-0 text-center pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase">Welcome back</CardTitle>
          <CardDescription className="text-purple-200/80 text-xs">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="px-1">
            <FieldGroup className="space-y-4 pt-1">
              <Field>
                <FieldLabel htmlFor="email" className="text-purple-100 text-xs">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-purple-100 text-xs">Password</FieldLabel>
                  <a
                    href="/auth/forgot-password"
                    className="text-[11px] text-purple-200/80 underline-offset-4 hover:underline hover:text-white"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-white/10 border-white/20 text-white focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>

              {errorMsg && (
                <p className="text-xs font-medium text-red-400 bg-red-950/40 p-2 rounded-md border border-red-500/30">
                  {errorMsg}
                </p>
              )}

              <div className="space-y-3 pt-2">
                <Button type="submit" disabled={loading} className="w-full bg-white text-[#110B3B] hover:bg-purple-100 font-semibold shadow-lg h-9 text-sm">
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <Button variant="outline" type="button" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white h-9 text-sm">
                  Login with Google
                </Button>
              </div>

              <FieldDescription className="text-center text-purple-200/70 text-xs pt-2">
                Don&apos;t have an account?{" "}
                <a href="/auth/signup" className="text-white font-medium underline underline-offset-4">
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}