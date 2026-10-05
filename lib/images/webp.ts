import sharp from "sharp";

/**
 * Decodifica e regrava o upload como WebP no servidor.
 *
 * O cliente ja redimensiona, mas nao da para confiar nele: sem isto qualquer
 * binario subia para o bucket publico com Content-Type image/webp. Se o
 * arquivo nao for uma imagem valida, o sharp falha e o upload e recusado.
 */
export async function reencodeUploadToWebp(file: File) {
  const input = Buffer.from(await file.arrayBuffer());

  try {
    const output = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    return new Uint8Array(output);
  } catch {
    throw new Error("Arquivo de imagem invalido.");
  }
}
