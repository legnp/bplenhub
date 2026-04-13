import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfólio de Serviços",
  description: "Gerenciamento centralizado de produtos e serviços do ecossistema BPlen.",
};

export default function AdminProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
