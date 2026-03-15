import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const SERVICE_LABELS: Record<string, string> = {
  retwist: 'Retwist',
  depart: 'Depart de Locks',
  detartrage: 'Detartrage',
}

export async function sendBookingConfirmation(params: {
  name: string
  email?: string
  service: string
  date: string
  time: string
}) {
  if (!params.email) return

  await transporter.sendMail({
    from: `Locks Flow <${process.env.GMAIL_USER}>`,
    to: params.email,
    subject: 'Ton RDV Locks Flow est confirme',
    html: `
      <div style="font-family: sans-serif; background: #080808; color: #F2EDE5; padding: 40px; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 24px; font-weight: 900; margin-bottom: 30px;">locks<span style="color: #F97316;">.</span>flow</div>
        <h2 style="font-size: 20px; margin-bottom: 20px;">Bonjour ${params.name},</h2>
        <p style="opacity: 0.8; margin-bottom: 20px;">Ton RDV est confirme. On t'attend !</p>
        <div style="background: #121212; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <div style="margin-bottom: 10px;"><strong>Service :</strong> ${SERVICE_LABELS[params.service]}</div>
          <div style="margin-bottom: 10px;"><strong>Date :</strong> ${params.date}</div>
          <div><strong>Heure :</strong> ${params.time}</div>
        </div>
        <p style="opacity: 0.5; font-size: 12px;">© 2025 Locks Flow — Neuilly-sur-Marne</p>
      </div>
    `,
  })
}

export async function sendOwnerNotification(params: {
  name: string
  phone: string
  service: string
  date: string
  time: string
}) {
  await transporter.sendMail({
    from: `Locks Flow <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER!,
    subject: `Nouveau RDV — ${params.name} — ${params.date} ${params.time}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Nouveau RDV Locks Flow</h2>
        <p><strong>Client :</strong> ${params.name}</p>
        <p><strong>Tel :</strong> ${params.phone}</p>
        <p><strong>Service :</strong> ${SERVICE_LABELS[params.service]}</p>
        <p><strong>Date :</strong> ${params.date}</p>
        <p><strong>Heure :</strong> ${params.time}</p>
        <br>
        <a href="https://wa.me/${process.env.OWNER_WHATSAPP}?text=Nouveau+RDV+${encodeURIComponent(params.name)}+le+${encodeURIComponent(params.date)}+a+${encodeURIComponent(params.time)}"
           style="background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Voir sur WhatsApp
        </a>
      </div>
    `,
  })
}

export async function sendReminderEmail(params: {
  name: string
  email: string
  time: string
}) {
  await transporter.sendMail({
    from: `Locks Flow <${process.env.GMAIL_USER}>`,
    to: params.email,
    subject: 'Rappel — Ton RDV Locks Flow est demain',
    html: `
      <div style="font-family: sans-serif; background: #080808; color: #F2EDE5; padding: 40px; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 24px; font-weight: 900; margin-bottom: 30px;">locks<span style="color: #F97316;">.</span>flow</div>
        <h2>Hey ${params.name} !</h2>
        <p style="opacity: 0.8; margin: 20px 0;">Rappel : ton RDV Locks Flow est <strong>demain a ${params.time}</strong>. On t'attend !</p>
        <p style="opacity: 0.5; font-size: 12px;">© 2025 Locks Flow — Neuilly-sur-Marne</p>
      </div>
    `,
  })
}
