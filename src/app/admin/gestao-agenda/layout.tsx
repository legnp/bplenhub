import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programação Hub",
  description: "Gestão integrada de programação e agenda operacional.",
};

export default function AdminGestaoAgendaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
