// Gera os templates de e-mail do Supabase a partir de um unico layout.
// Rode:  node scripts/build-email-templates.mjs
// Depois cole cada arquivo no painel: Authentication > Email Templates.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "email-templates");
mkdirSync(outDir, { recursive: true });

/** Botao "bulletproof" (com fallback VML para Outlook). */
function button(label, url) {
  return `          <tr>
            <td align="center" style="padding:0 40px 8px 40px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="52%" strokecolor="#1f1a15" fillcolor="#1f1a15">
                <w:anchorlock/>
                <center style="color:#f8f1d8;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <a href="${url}" target="_blank"
                 style="display:inline-block; background-color:#1f1a15; color:#f8f1d8; font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:bold; text-decoration:none; padding:16px 34px; border-radius:999px;">
                ${label}
              </a>
              <!--<![endif]-->
            </td>
          </tr>

          <tr>
            <td style="padding:26px 40px 4px 40px;">
              <p style="margin:0 0 8px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:1.6; color:#8a8076;">
                Se o botão não funcionar, copie e cole este endereço no navegador:
              </p>
              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:1.6; word-break:break-all;">
                <a href="${url}" target="_blank" style="color:#a5813c; text-decoration:underline;">${url}</a>
              </p>
            </td>
          </tr>`;
}

/** Bloco de codigo grande (para reautenticacao / OTP). */
function codeBlock(token) {
  return `          <tr>
            <td align="center" style="padding:0 40px 8px 40px;">
              <div style="display:inline-block; background-color:#faf6ef; border:1px solid #e6decf; border-radius:12px; padding:18px 34px; font-family:'Courier New',Courier,monospace; font-size:32px; letter-spacing:8px; font-weight:bold; color:#1f1a15;">
                ${token}
              </div>
            </td>
          </tr>`;
}

function note(text) {
  if (!text) return "";
  return `          <tr>
            <td style="padding:24px 40px 36px 40px;">
              <div style="border-top:1px solid #efe7d8; padding-top:20px;">
                <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:1.6; color:#8a8076;">
                  ${text}
                </p>
              </div>
            </td>
          </tr>`;
}

function paragraphs(items) {
  return items
    .map(
      (p, i) =>
        `              <p style="margin:0 0 ${i === items.length - 1 ? "28" : "16"}px 0; font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:1.65; color:#4a443c;">
                ${p}
              </p>`
    )
    .join("\n");
}

function template({ file, subject, preheader, h1, body, cta, code, security }) {
  const middle = cta ? button(cta.label, cta.url) : codeBlock(code);

  const html = `<!--
  PrivacyLog — ${subject}
  Cole em: Supabase → Authentication → Email Templates.
  Assunto sugerido: ${subject}
  Variável usada: ${cta ? cta.url : code}
-->
<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <title>${h1}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f1ece3; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1ece3;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff; border:1px solid #e6decf; border-radius:14px; overflow:hidden;">

          <tr>
            <td align="center" style="padding:36px 40px 22px 40px; border-bottom:1px solid #efe7d8;">
              <div style="font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:1; letter-spacing:0.3px; color:#1f1a15;">
                Privacy<span style="color:#a5813c;">Log</span>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#a5813c; margin-top:10px;">
                Casas de massagem, clínicas e privês
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:38px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-family:Georgia,'Times New Roman',serif; font-weight:normal; font-size:26px; line-height:1.25; color:#1f1a15;">
                ${h1}
              </h1>
${paragraphs(body)}
            </td>
          </tr>

${middle}

${note(security)}

          <tr>
            <td align="center" style="padding:24px 40px 30px 40px; background-color:#faf6ef; border-top:1px solid #efe7d8;">
              <p style="margin:0 0 4px 0; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#1f1a15;">
                Equipe Privacy<span style="color:#a5813c;">Log</span>
              </p>
              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.6; color:#a89e90;">
                Discrição, organização e confiança.<br />
                © PrivacyLog · privacylog.com.br
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  writeFileSync(join(outDir, file), html, "utf8");
  console.log("gerado:", file, "—", subject);
}

const URL = "{{ .ConfirmationURL }}";
const TOKEN = "{{ .Token }}";

template({
  file: "confirm-signup.html",
  subject: "Confirme o seu cadastro no PrivacyLog",
  preheader: "Confirme o seu e-mail para ativar a página da sua casa no PrivacyLog.",
  h1: "Confirme o seu cadastro",
  body: [
    "Que bom ter você no PrivacyLog. Falta só um passo para ativar o acesso da sua casa: confirme o seu e-mail no botão abaixo.",
    "Em seguida você conclui a assinatura e a sua página entra no ar.",
  ],
  cta: { label: "Confirmar meu e-mail", url: URL },
  security:
    "Você não criou esta conta? Pode ignorar este e-mail com segurança — nenhum cadastro é ativado sem esta confirmação.",
});

template({
  file: "reset-password.html",
  subject: "Redefinir a sua senha — PrivacyLog",
  preheader: "Redefina a senha da sua conta PrivacyLog.",
  h1: "Redefinir a sua senha",
  body: [
    "Recebemos um pedido para redefinir a senha da sua conta PrivacyLog. Clique no botão abaixo para criar uma nova senha.",
    "Por segurança, este link expira em pouco tempo.",
  ],
  cta: { label: "Criar nova senha", url: URL },
  security:
    "Não pediu para redefinir a senha? Ignore este e-mail — a sua senha atual continua a mesma.",
});

template({
  file: "magic-link.html",
  subject: "Seu link de acesso — PrivacyLog",
  preheader: "Seu link de acesso ao painel PrivacyLog.",
  h1: "Seu link de acesso",
  body: [
    "Use o botão abaixo para entrar na sua conta PrivacyLog sem precisar de senha.",
    "Por segurança, este link é de uso único e expira em pouco tempo.",
  ],
  cta: { label: "Entrar na minha conta", url: URL },
  security: "Não solicitou este acesso? Pode ignorar este e-mail com segurança.",
});

template({
  file: "change-email.html",
  subject: "Confirme o seu novo e-mail — PrivacyLog",
  preheader: "Confirme o seu novo endereço de e-mail no PrivacyLog.",
  h1: "Confirme o seu novo e-mail",
  body: [
    "Recebemos um pedido para alterar o e-mail da sua conta PrivacyLog. Confirme no botão abaixo para concluir a mudança.",
    "A alteração só passa a valer depois desta confirmação.",
  ],
  cta: { label: "Confirmar novo e-mail", url: URL },
  security:
    "Não pediu esta alteração? Ignore este e-mail e, por precaução, fale com o nosso suporte.",
});

template({
  file: "invite.html",
  subject: "Seu convite para o PrivacyLog",
  preheader: "Você foi convidado para o PrivacyLog.",
  h1: "Você foi convidado",
  body: [
    "Você recebeu um convite para acessar o PrivacyLog. Clique no botão abaixo para criar o seu acesso e configurar a sua casa.",
  ],
  cta: { label: "Aceitar convite", url: URL },
  security: "Não esperava este convite? Pode ignorar este e-mail com segurança.",
});

template({
  file: "reauthentication.html",
  subject: "Seu código de verificação — PrivacyLog",
  preheader: "Seu código de verificação PrivacyLog.",
  h1: "Código de verificação",
  body: ["Use o código abaixo para confirmar a ação solicitada na sua conta:"],
  code: TOKEN,
  security: "Não reconhece esta solicitação? Ignore este e-mail e mantenha a sua senha em segredo.",
});

console.log("\nTodos os templates gerados em supabase/email-templates/");
