import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão de Usuários",
  description: "Gerenciamento centralizado de membros e permissões do HUB.",
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
