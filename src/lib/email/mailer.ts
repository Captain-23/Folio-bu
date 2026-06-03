import nodemailer from 'nodemailer'

type SendMailOptions = {
  to: string
  subject: string
  text: string
  html: string
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM)
}

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host) {
    throw new Error('SMTP is not configured')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log(`[email:dev] To: ${options.to}\nSubject: ${options.subject}\n\n${options.text}`)
    return
  }

  const transport = getTransport()
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
}

export function isEmailDeliveryConfigured(): boolean {
  return isSmtpConfigured()
}

export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  purpose: 'signup' | 'login'
): Promise<{ delivered: boolean }> {
  const action = purpose === 'signup' ? 'complete your Folio BU signup' : 'sign in to Folio BU'
  const subject = `Your Folio BU verification code: ${code}`
  const text = `Your verification code is ${code}. Use it to ${action}. It expires in 10 minutes. If you did not request this, ignore this email.`
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color: #6b4e31;">Folio BU</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Use it to ${action}. This code expires in <strong>10 minutes</strong>.</p>
      <p style="color: #666; font-size: 14px;">If you did not request this, you can ignore this email.</p>
    </div>
  `

  await sendMail({ to: email, subject, text, html })
  return { delivered: isSmtpConfigured() }
}
