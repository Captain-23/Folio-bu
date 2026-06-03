'use client'

import { useState } from 'react'
import { EmailVerificationStep } from '@/components/email-verification-step'
import { SignupCommunityRules } from '@/components/signup-community-rules'
import { useAuth } from '@/contexts/auth-context'
import { BENNETT_EMAIL_ERROR, isBennettEmail } from '@/lib/bennett-email'
import { COMMUNITY_RULES_REQUIRED_ERROR } from '@/lib/community-rules'

type AuthStep = 'credentials' | 'verify'

export default function AuthPage() {
  const { sendAuthCode, confirmAuthCode } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<AuthStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [acceptedCommunityRules, setAcceptedCommunityRules] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateBennettEmail = () => {
    if (!isBennettEmail(email)) {
      setError(BENNETT_EMAIL_ERROR)
      return false
    }
    return true
  }

  const resetToCredentials = () => {
    setStep('credentials')
    setVerificationCode('')
    setDevCode(null)
    setError('')
  }

  const handleSendLoginCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    if (!validateBennettEmail()) return

    setLoading(true)
    try {
      const result = await sendAuthCode({ purpose: 'login', email, password })
      setDevCode(result.devCode ?? null)
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleSendSignupCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (!validateBennettEmail()) return

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!acceptedCommunityRules) {
      setError(COMMUNITY_RULES_REQUIRED_ERROR)
      return
    }

    setLoading(true)
    try {
      const result = await sendAuthCode({
        purpose: 'signup',
        email,
        password,
        agreedToRules: true,
      })
      setDevCode(result.devCode ?? null)
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await confirmAuthCode(email, verificationCode, activeTab)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      const result =
        activeTab === 'login'
          ? await sendAuthCode({ purpose: 'login', email, password })
          : await sendAuthCode({
              purpose: 'signup',
              email,
              password,
              agreedToRules: true,
            })
      setDevCode(result.devCode ?? null)
      setVerificationCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-low text-on-background min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-body-md">
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none"></div>
      <div className="absolute top-10 left-10 w-8 h-8 bg-primary opacity-20 z-0 pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-secondary opacity-20 z-0 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-[600px]">
        <div className="bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_theme(colors.tertiary)] relative">
          <div className="absolute -left-4 top-4 bottom-4 w-6 flex flex-col justify-between py-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-2 bg-on-background shadow-[2px_2px_0px_0px_theme(colors.surface)]"
              />
            ))}
          </div>

          <div className="border-b-4 border-on-background p-6 bg-surface-container flex items-center justify-between">
            <div>
              <h1 className="font-headline-lg text-headline-lg uppercase text-primary tracking-tighter">
                Folio BU
              </h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">
                Chronicle Protocol v1.0
              </p>
            </div>
            <span
              className="material-symbols-outlined text-4xl text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              menu_book
            </span>
          </div>

          {step === 'credentials' && (
            <div className="flex border-b-4 border-on-background bg-surface-variant font-label-lg text-label-lg uppercase">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login')
                  setError('')
                  setAcceptedCommunityRules(false)
                }}
                className={`flex-1 py-4 px-2 text-center border-r-4 border-on-background transition-colors ${
                  activeTab === 'login'
                    ? 'bg-surface text-primary border-b-4 border-b-surface -mb-[4px] relative z-10'
                    : 'text-on-surface-variant hover:bg-surface'
                }`}
              >
                Enter Village
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup')
                  setError('')
                  setAcceptedCommunityRules(false)
                }}
                className={`flex-1 py-4 px-2 text-center transition-colors ${
                  activeTab === 'signup'
                    ? 'bg-surface text-primary border-b-4 border-b-surface -mb-[4px] relative z-10'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Join Chronicle
              </button>
            </div>
          )}

          <div className="p-8 relative">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_23px,theme('colors.on-background')_24px)] opacity-[0.05] bg-[length:100%_24px] pointer-events-none z-0"></div>

            {step === 'credentials' && error && (
              <div className="relative z-10 mb-4 p-3 bg-error-container border-2 border-on-background text-on-error-container font-label-sm text-label-sm">
                {error}
              </div>
            )}

            {step === 'credentials' && (
              <p className="relative z-10 mb-4 font-label-sm text-label-sm text-on-surface-variant text-center">
                Bennett students only — use your <strong>@bennett.edu.in</strong> email. We will
                email you a 6-digit code to verify.
              </p>
            )}

            {step === 'verify' ? (
              <EmailVerificationStep
                email={email}
                code={verificationCode}
                onCodeChange={setVerificationCode}
                onSubmit={handleVerify}
                onResend={handleResend}
                onBack={resetToCredentials}
                loading={loading}
                error={error}
                devCode={devCode}
                variant={activeTab}
              />
            ) : activeTab === 'login' ? (
              <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSendLoginCode}>
                <div className="text-center mb-4">
                  <span
                    className="material-symbols-outlined text-5xl text-primary mb-2 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    vpn_key
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-background">
                    Welcome Back, Traveler
                  </h2>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg text-on-background uppercase">
                    Email
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-primary p-3 font-body-md text-body-md text-on-background shadow-brutal-inset"
                    placeholder="you@bennett.edu.in"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg text-on-background uppercase">
                    Password
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-primary p-3 font-body-md text-body-md text-on-background shadow-brutal-inset"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full bg-primary-container text-on-primary-container border-2 border-on-background font-label-lg text-label-lg uppercase py-4 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Sending code...' : 'Send verification code'}</span>
                  <span className="material-symbols-outlined text-xl">mail</span>
                </button>
              </form>
            ) : (
              <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSendSignupCode}>
                <div className="text-center mb-4">
                  <span
                    className="material-symbols-outlined text-5xl text-secondary mb-2 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    person_add
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-background">
                    Begin Your Journey
                  </h2>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg text-on-background uppercase">
                    Contact Scroll (Email)
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-secondary p-3 font-body-md text-body-md text-on-background shadow-brutal-inset"
                    placeholder="you@bennett.edu.in"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg text-on-background uppercase">
                    Secret Code
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-secondary p-3 font-body-md text-body-md text-on-background shadow-brutal-inset"
                    placeholder="Create password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg text-on-background uppercase">
                    Confirm Secret Code
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-secondary p-3 font-body-md text-body-md text-on-background shadow-brutal-inset"
                    placeholder="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <SignupCommunityRules
                  checked={acceptedCommunityRules}
                  onChange={setAcceptedCommunityRules}
                  variant="pixel"
                />

                <button
                  type="submit"
                  disabled={loading || !acceptedCommunityRules}
                  className="mt-4 w-full bg-secondary text-on-secondary border-2 border-on-background font-label-lg text-label-lg uppercase py-4 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Sending code...' : 'Send verification code'}</span>
                  <span className="material-symbols-outlined text-xl">mail</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
