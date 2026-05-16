import nodemailer from 'nodemailer';

// These environment variables need to be set in Vercel
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendPaymentInstructionsEmail = async (userEmail: string) => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.log('Mail setup incomplete. Skipping email to user.');
      return;
  }

  const mailOptions = {
    from: `"Platformă Chestionare" <${SMTP_USER}>`,
    to: userEmail,
    subject: "Activează-ți Accesul Complet - Detalii de Plată",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-w-lg mx-auto">
        <h2 style="color: #2563eb;">Activează-ți Accesul Complet</h2>
        <p>Salut,</p>
        <p>Pentru a debloca setul complet de 45 de întrebări, cronometrul și istoricul detaliat, este necesară achitarea licenței.</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalii de plată</h3>
          <p><strong>Cost acces:</strong> 00 lei (plată unică)</p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Nume Beneficiar:</strong> SC Nume Firma SRL</li>
            <li><strong>IBAN:</strong> ROXX XXXX XXXX XXXX XXXX XXXX</li>
            <li><strong>Bancă:</strong> Nume Bancă</li>
            <li><strong style="color: #dc2626;">Detalii plată / Referință (Obligatoriu):</strong> ${userEmail}</li>
          </ul>
        </div>

        <p>După efectuarea transferului, echipa noastră va verifica tranzacția și îți va activa contul. Procesarea se face de regulă în aceeași zi, imediat ce plata devine vizibilă.</p>
        <p>Vei primi un email de confirmare când contul este activ.</p>
        <br>
        <p>Mulțumim,<br>Echipa Platformei</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminNotificationEmail = async (newUserEmail: string) => {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
        console.log('Mail setup incomplete. Skipping email to admin.');
        return;
    }

    const mailOptions = {
      from: `"Sistem Alerte" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: "Utilizator Nou - În Așteptare",
      text: `A fost creat un cont nou care așteaptă activarea manuală.\n\nEmail utilizator: ${newUserEmail}\n\nVerifică plățile bancare și activează utilizatorul din panoul de admin.`
    };

    await transporter.sendMail(mailOptions);
};
