import fs from "fs";

interface DDSHeader {
  height: number;
  width: number;
  mipMapCount: number;
  pixelFormat: number;
  pixelData: Buffer;
}

/**
 * Parses a DDS (DirectDraw Surface) file and extracts its header information.
 *
 * @param filePath - The path to the DDS file to be read and parsed.
 * @returns An object containing the DDS header information including
 *          height, width, mipMapCount, pixelFormat, and pixelData.
 * @throws Will throw an error if the file is not a valid DDS file.
 */
function parseDDS(filePath: string): DDSHeader {
  const buffer = fs.readFileSync(filePath);

  // Verify magic number
  const magicNumber = buffer.toString("ascii", 0, 4);
  if (magicNumber !== "DDS ") {
    throw new Error("Invalid DDS file");
  }

  const height = buffer.readUInt32LE(12);
  const width = buffer.readUInt32LE(16);
  const mipMapCount = buffer.readUInt32LE(28);
  const pixelFormat = buffer.readUInt32LE(84);

  const pixelData = buffer.slice(128);

  return {
    height,
    width,
    mipMapCount,
    pixelFormat,
    pixelData,
  };
}

export default parseDDS;
