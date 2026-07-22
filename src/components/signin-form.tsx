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

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

// Dentro src/components/login-form.tsx

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setLoading(true)
  setErrorMsg(null)

  const formData = new FormData(e.currentTarget)

  try {
    // CAMBIO QUI: punta a /api/auth/signin invece di /login
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
      // Reindirizzamento alla dashboard
      window.location.href = "/dashboard"
    }
  } catch (err) {
    console.error(err)
    setErrorMsg("Si è verificato un errore di rete. Riprova.")
  } finally {
    setLoading(false)
  }
}
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </Field>

              {/* Visualizzazione errori */}
              {errorMsg && (
                <p className="text-sm font-medium text-red-500">
                  {errorMsg}
                </p>
              )}

              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="/auth/signup">Sign up</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}