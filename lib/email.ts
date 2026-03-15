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
  depart: 'Départ de Locks',
  detartrage: 'Entretien & Détartrage',
  reparation: 'Réparation',
}

// Email envoyé immédiatement après la réservation — en attente de validation
export async function sendBookingPending(params: {
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
    subject: 'Demande de RDV reçue — Locks Flow',
    html: `
      <div style="font-family: sans-serif; background: #080808; color: #F2EDE5; padding: 40px; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 24px; font-weight: 900; margin-bottom: 30px;">locks<span style="color: #F97316;">.</span>flow</div>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Bonjour ${params.name},</h2>
        <p style="opacity: 0.8; margin-bottom: 8px;">Ta demande de RDV a bien été reçue.</p>
        <p style="opacity: 0.6; margin-bottom: 24px; font-size: 14px;">Elle est en attente de validation. Tu recevras un second email dès que ton créneau est confirmé.</p>
        <div style="background: #121212; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 3px solid #F59E0B;">
          <div style="color: #F59E0B; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;">En attente de validation</div>
          <div style="margin-bottom: 10px;"><strong>Service :</strong> ${SERVICE_LABELS[params.service] || params.service}</div>
          <div style="margin-bottom: 10px;"><strong>Date :</strong> ${params.date}</div>
          <div><strong>Heure :</strong> ${params.time}</div>
        </div>
        <p style="opacity: 0.5; font-size: 12px;">© 2025 Locks Flow — Neuilly-sur-Marne</p>
      </div>
    `,
  })
}

// Email envoyé quand l'admin confirme le RDV
export async function sendBookingConfirmed(params: {
  name: string
  email: string
  service: string
  date: string
  time: string
}) {
  await transporter.sendMail({
    from: `Locks Flow <${process.env.GMAIL_USER}>`,
    to: params.email,
    subject: '✓ RDV confirmé — Locks Flow',
    html: `
      <div style="font-family: sans-serif; background: #080808; color: #F2EDE5; padding: 40px; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 24px; font-weight: 900; margin-bottom: 30px;">locks<span style="color: #F97316;">.</span>flow</div>
        <h2 style="font-size: 20px; margin-bottom: 16px;">C'est dans le flow, ${params.name} !</h2>
        <p style="opacity: 0.8; margin-bottom: 24px;">Ton RDV est confirmé. On t'attend.</p>
        <div style="background: #121212; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 3px solid #10B981;">
          <div style="color: #10B981; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;">Confirmé</div>
          <div style="margin-bottom: 10px;"><strong>Service :</strong> ${SERVICE_LABELS[params.service] || params.service}</div>
          <div style="margin-bottom: 10px;"><strong>Date :</strong> ${params.date}</div>
          <div><strong>Heure :</strong> ${params.time}</div>
        </div>
        <p style="opacity: 0.5; font-size: 12px;">© 2025 Locks Flow — Neuilly-sur-Marne</p>
      </div>
    `,
  })
}

// Alias pour compatibilité (rappels)
export async function sendBookingConfirmation(params: {
  name: string
  email?: string
  service: string
  date: string
  time: string
}) {
  if (!params.email) return
  return sendBookingPending(params)
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
