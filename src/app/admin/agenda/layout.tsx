import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sincronizar Agenda",
  description: "Painel de sincronização entre Google Calendar e BPlen HUB.",
};

export default function AdminAgendaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
