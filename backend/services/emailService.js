const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    return transporter;
};

const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const sendReminderEmail = async ({ to, reminder, documentName }) => {
    const mailer = getTransporter();
    if (!mailer) throw new Error("SMTP is not configured.");

    const dueDate = new Date(`${reminder.due_date}T00:00:00.000Z`).toLocaleDateString("en-IN", {
        dateStyle: "long",
        timeZone: "UTC",
    });
    const documentLine = documentName
        ? `<p><strong>Document:</strong> ${escapeHtml(documentName)}</p>`
        : "";

    await mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: `LifeHub reminder: ${reminder.title}`,
        text: `${reminder.title}\nDue: ${dueDate}${documentName ? `\nDocument: ${documentName}` : ""}\n\n${reminder.description || ""}`,
        html: `<h2>${escapeHtml(reminder.title)}</h2><p><strong>Due:</strong> ${dueDate}</p>${documentLine}<p>${escapeHtml(reminder.description)}</p>`,
    });
};

module.exports = { getTransporter, sendReminderEmail };
