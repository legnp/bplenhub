import { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Administração",
    template: "BPlen | %s",
  },
  description: "Painel de controle administrativo do ecossistema BPlen.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
