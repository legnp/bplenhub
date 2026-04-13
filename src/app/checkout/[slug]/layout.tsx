import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Ativação",
  description: "Finalize a contratação do seu serviço BPlen com segurança e agilidade.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
