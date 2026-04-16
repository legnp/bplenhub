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

  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);

  // Calcular o tamanho do bounding box para a imagem rotacionada
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Definir o tamanho do canvas para o bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Configurações de rotação e translação
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Desenhar a imagem inteira no canvas temporário rotacionado
  ctx.drawImage(image, 0, 0);

  // Criar o canvas final de 800x800 🎯
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = 800;
  finalCanvas.height = 800;
  const finalCtx = finalCanvas.getContext("2d");

  if (!finalCtx) return null;

  // Capturar a área recortada do canvas rotacionado e desenhar no finalCanvas (fazendo o SCALE)
  finalCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    800,
    800
  );

  return new Promise((resolve) => {
    finalCanvas.toBlob((file) => {
      resolve(file);
    }, "image/webp", 0.9);
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
