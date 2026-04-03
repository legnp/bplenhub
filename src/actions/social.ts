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
import { SocialPost } from "@/types/social";
import { revalidatePath } from "next/cache";

const COLLECTION_NAME = "social_posts";

/**
 * BPlen HUB — Social Media Actions 📡
 * Gerencia o CRUD de postagens manuais para a vitrine de conteúdo.
 */

export async function getSocialPosts(onlyActive: boolean = false) {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    let q;
    
    if (onlyActive) {
      q = query(
        postsRef, 
        where("isActive", "==", true),
        orderBy("publishedAt", "desc")
      );
    } else {
      q = query(postsRef, orderBy("publishedAt", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const posts: SocialPost[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
      } as SocialPost);
    });

    return posts;
  } catch (error) {
    console.error("Erro ao buscar posts sociais:", error);
    throw new Error("Falha ao carregar postagens.");
  }
}

export async function createSocialPost(data: Omit<SocialPost, "id" | "createdAt" | "updatedAt">) {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(postsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar post social:", error);
    throw new Error("Falha ao salvar postagem.");
  }
}

export async function updateSocialPost(id: string, data: Partial<SocialPost>) {
  try {
    const postRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(postRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar post social:", error);
    throw new Error("Falha ao atualizar postagem.");
  }
}

export async function deleteSocialPost(id: string) {
  try {
    const postRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(postRef);
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post social:", error);
    throw new Error("Falha ao remover postagem.");
  }
}

export async function togglePostStatus(id: string, field: "isActive" | "isFeatured", currentValue: boolean) {
  try {
    const postRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(postRef, {
      [field]: !currentValue,
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath("/admin/social");
    revalidatePath("/conteudo");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar status do post:", error);
    throw new Error("Falha ao alterar visibilidade/destaque.");
  }
}
