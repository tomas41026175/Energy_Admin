import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginRequestSchema, type LoginRequestInput } from '@/auth/auth.schemas'
import { useAuthStore } from '@/auth/auth.store'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequestInput>({
    resolver: zodResolver(loginRequestSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginRequestInput): Promise<void> => {
    setSubmitError(null)
    try {
      await login(data)
      navigate('/users', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Energy Admin</h1>

          <main id="main-content">
            <form
              onSubmit={(e) => void handleSubmit(onSubmit)(e)}
              className="bg-white shadow-sm rounded-lg p-8 space-y-6"
              noValidate
            >
              {submitError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  {submitError}
                </div>
              )}

              <Input
                label="Username"
                type="text"
                autoComplete="username"
                error={errors.username?.message}
                {...register('username')}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="w-full">
                Sign In
              </Button>
            </form>
          </main>
        </div>
      </div>
    </>
  )
}

export default LoginPage
