/**
 * Utilitário para geração de strings no padrão vCard 3.0.
 * Compatível com iOS e Android para salvar contatos via QR Code.
 */

export function generateVCard(data: {
  name: string;
  role: string;
  phone: string;
  email: string;
  url?: string;
  org?: string;
}) {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.name}`,
    `N:${data.name.split(" ").reverse().join(";")};;;`,
    `ORG:${data.org || "BPlen HUB"}`,
    `TITLE:${data.role}`,
    `TEL;TYPE=CELL,VOICE:${data.phone}`,
    `EMAIL;TYPE=PREF,INTERNET:${data.email}`,
    data.url ? `URL:${data.url}` : "",
    "END:VCARD"
  ].filter(Boolean).join("\n");

  return vcard;
}
