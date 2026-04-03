"use server";

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";

const COLLECTION_NAME = "content_posts";

/**
 * BPlen HUB — Social Media Actions
 * Gerencia o CRUD de postagens manuais para a vitrine de conteúdo.
 */

export async function getSocialPosts(onlyActive: boolean = false) {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    // Simplificamos a query para evitar a exigência de índices compostos no Firestore durante o build
    const q = query(postsRef);

    const querySnapshot = await getDocs(q);
    let posts: SocialPost[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
      } as SocialPost);
    });

    // Filtramos e ordenamos em memória (Seguro para bases pequenas/médias)
    if (onlyActive) {
      posts = posts.filter(p => p.isActive);
    }

    // Ordenação por data (descendente)
    posts.sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return posts;
  } catch (error) {
    console.error("Erro ao buscar posts sociais:", error);
    throw new Error("Falha ao carregar postagens.");
  }
}

export async function createSocialPost(data: Omit<SocialPost, "id" | "createdAt" | "updatedAt">, adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    const postsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(postsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Erro ao criar post social:", error);
    throw new Error(error.message || "Falha ao salvar postagem.");
  }
}

export async function updateSocialPost(id: string, data: Partial<SocialPost>, adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    const postRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(postRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar post social:", error);
    throw new Error(error.message || "Falha ao atualizar postagem.");
  }
}

export async function deleteSocialPost(id: string, adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    const postRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(postRef);
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao deletar post social:", error);
    throw new Error(error.message || "Falha ao remover postagem.");
  }
}

export async function togglePostStatus(id: string, field: "isActive" | "isFeatured", currentValue: boolean, adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    const postRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(postRef, {
      [field]: !currentValue,
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao alternar status do post:", error);
    throw new Error(error.message || "Falha ao alterar visibilidade/destaque.");
  }
}
