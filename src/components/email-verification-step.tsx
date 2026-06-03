'use client'

type EmailVerificationStepProps = {
  email: string
  code: string
  onCodeChange: (code: string) => void
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
  onBack: () => void
  loading: boolean
  error: string
  devCode?: string | null
  variant?: 'login' | 'signup'
}

export function EmailVerificationStep({
  email,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
  loading,
  error,
  devCode,
  variant = 'login',
}: EmailVerificationStepProps) {
  return (
    <form className="relative z-10 flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="text-center mb-2">
        <span
          className="material-symbols-outlined text-5xl text-secondary mb-2 block"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          mark_email_read
        </span>
        <h2 className="font-headline-md text-headline-md text-on-background">Check your email</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {devCode && (
        <div className="p-3 bg-secondary-container border-2 border-on-background font-label-sm text-label-sm text-on-secondary-container">
          Dev mode (no SMTP): your code is <strong className="tracking-widest">{devCode}</strong>
        </div>
      )}

      {error && (
        <div className="p-3 bg-error-container border-2 border-on-background text-on-error-container font-label-sm text-label-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-label-lg text-label-lg text-on-background uppercase">
          Verification code
        </label>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-primary p-3 font-headline-md text-headline-md text-center tracking-[0.4em] text-on-background"
          placeholder="000000"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className={`w-full border-2 border-on-background font-label-lg text-label-lg uppercase py-4 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 flex items-center justify-center gap-2 disabled:opacity-50 ${
          variant === 'signup'
            ? 'bg-secondary text-on-secondary'
            : 'bg-primary-container text-on-primary-container'
        }`}
      >
        <span>{loading ? 'Verifying...' : 'Verify & continue'}</span>
        <span className="material-symbols-outlined text-xl">verified</span>
      </button>

      <div className="flex flex-col sm:flex-row gap-2 justify-between text-center">
        <button
          type="button"
          onClick={onBack}
          className="font-label-sm text-label-sm text-on-surface-variant underline"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="font-label-sm text-label-sm text-primary underline disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    </form>
  )
}
