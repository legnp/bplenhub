import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROFISSIONAIS } from "@/config/profissionais";
import { ProfessionalProfileView } from "@/components/ui/ProfessionalProfileView";
import { HomeFooter } from "@/components/home/HomeFooter";
import { ParticleNexus } from "@/components/home/ParticleNexus";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * ROTA DINÂMICA DE PERFIL PROFISSIONAL 🧬
 * Caminho: /profissionais/[slug]
 */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = PROFISSIONAIS[slug];

  if (!profile) return { title: "Profissional não encontrado" };

  return {
    title: `${profile.name} | Perfil Profissional`,
    description: profile.shortBio,
    openGraph: {
      title: `${profile.name} | Perfil Profissional`,
      description: profile.shortBio,
      images: [profile.photo],
    },
  };
}

export default async function ProfessionalPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = PROFISSIONAIS[slug];

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white relative isolate overflow-x-hidden theme-dark">
      
      {/* Visualização de Camadas (Cartão + Bio) */}
      <ProfessionalProfileView profile={profile} />

      {/* Rodapé Oficial Público */}
      <HomeFooter />

      {/* 
          🌌 Camada Global de Partículas 
          (Obs: FloatingCTAs e SocialSidebar foram removidos propositalmente nesta rota)
      */}
      <ParticleNexus />
      
    </main>
  );
}

/**
 * Pré-configura as rotas para build estático (Performance SSD)
 */
export async function generateStaticParams() {
  return Object.keys(PROFISSIONAIS).map((slug) => ({
    slug,
  }));
}
