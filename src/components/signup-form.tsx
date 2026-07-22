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

export function SignUpForm({
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
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (password !== confirmPassword) {
      setErrorMsg("Le password non coincidono.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || "Errore durante la registrazione.")
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
        <CardHeader className="px-0 pt-0 text-center pb-3">
          <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase">Create an account</CardTitle>
          <CardDescription className="text-purple-200/80 text-xs">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
<form onSubmit={handleSubmit} className="px-1">
            {/* Griglia principale a 2 colonne con un piccolo spazio di sicurezza ai lati */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              
              {/* Nome */}
              <Field>
                <FieldLabel htmlFor="firstName" className="text-purple-100 text-xs">First Name</FieldLabel>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Mario"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>

              {/* Cognome */}
              <Field>
                <FieldLabel htmlFor="lastName" className="text-purple-100 text-xs">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Rossi"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>

              {/* Email */}
              <Field className="sm:col-span-2">
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

              {/* Telefono */}
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="phone" className="text-purple-100 text-xs">Phone Number <span className="text-purple-300/75 text-[10px]">(Optional)</span></FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+39 333 1234567"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="password" className="text-purple-100 text-xs">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-white/10 border-white/20 text-white focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-purple-100 text-xs">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="bg-white/10 border-white/20 text-white focus-visible:ring-purple-400 h-9 text-sm w-full"
                />
              </Field>
            </div>
            {errorMsg && (
              <p className="text-xs font-medium text-red-400 bg-red-950/40 p-2 rounded-md border border-red-500/30 mt-3">
                {errorMsg}
              </p>
            )}

            <div className="mt-4 space-y-3">
              <Button type="submit" disabled={loading} className="w-full bg-white text-[#110B3B] hover:bg-purple-100 font-semibold shadow-lg h-9 text-sm">
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </div>

            <FieldDescription className="text-center text-purple-200/70 text-xs pt-3">
              Already have an account?{" "}
              <a href="/auth/signin" className="text-white font-medium underline underline-offset-4">
                Sign in
              </a>
            </FieldDescription>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}