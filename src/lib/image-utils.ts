/**
 * BPlen HUB — Image Utilities 🖼️✨
 * Funções auxiliares para processamento de imagens, recorte e conversão.
 */

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Prevenir problemas de Canvas CORS
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Retorna uma imagem recortada em formato Blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // Calcular dimensões do canvas rotacionado
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Transladar contexto para desenhar a imagem centralizada e rotacionada
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Desenhar imagem
  ctx.drawImage(image, 0, 0);

  // Extrair a área recortada
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Redimensionar para o tamanho final (800x800) 🎯
  canvas.width = 800;
  canvas.height = 800;

  // Limpar e desenhar a área recortada redimensionada
  ctx.putImageData(data, 0, 0);
  
  // Criar um canvas final para redimensionamento suave (opcional, mas recomendado)
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = 800;
  finalCanvas.height = 800;
  const finalCtx = finalCanvas.getContext("2d");
  
  if (finalCtx) {
     finalCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, 800, 800);
  }

  return new Promise((resolve) => {
    finalCanvas.toBlob((file) => {
      resolve(file);
    }, "image/webp", 0.9); // Alta qualidade WebP
  });
}

/**
 * Calcula o tamanho necessário para conter uma imagem rotacionada.
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Converte um Blob para Base64 (útil para pré-visualização ou envio via Server Actions).
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
