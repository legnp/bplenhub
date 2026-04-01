import { format } from "date-fns";

interface IcsEventOptions {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  uid: string;
}

/**
 * Utilitário para gerar conteúdo de arquivo .ics (iCalendar)
 * Essencial para anexar convites de calendário em emails.
 */
export function generateIcsString(options: IcsEventOptions): string {
  const { title, description, location, start, end, uid } = options;

  // Formatação para o padrão ICS: YYYYMMDDTHHMMSSZ (UTC)
  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BPlen HUB//NONSGML Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALERT",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Lembrete de Reunião BPlen",
    "END:VALERT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
