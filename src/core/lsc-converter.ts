import { join } from "path";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { convertDdsToPng } from "../lib/imgmagick";

/**
 * Applies a bitwise transformation to each byte in the given Uint8Array.
 * The transformation is as follows:
 * 1. Shift the lower 3 bits of the byte 5 places to the left.
 * 2. Shift the upper 5 bits of the byte 3 places to the right.
 * 3. OR the lower 3 bits shifted in step 1 with the upper 5 bits shifted in step 2.
 * 4. XOR the result with 0xff.
 * @param {Uint8Array} byteArray The Uint8Array to transform.
 * @returns {Uint8Array} The transformed Uint8Array.
 */
function TransformBytes(byteArray: Uint8Array): Uint8Array {
  const length = byteArray.length;

  for (let i = 0; i < length; i++) {
    let byte = byteArray[i];
    const lowerBits = (byte & 0x7) << 5;
    byte >>= 3;
    byte |= lowerBits;
    byte ^= 0xff;
    byteArray[i] = byte;
  }

  return byteArray;
}

/**
 * Converts `.lsc` files in the specified directory to both `.dds` and `.png` formats.
 *
 * This function searches for `.lsc` files within the given directory, processes
 * the first file it finds, transforms its bytes using a specified transformation,
 * and writes the transformed data to both `.dds` and `.png` files in the same directory.
 *
 * @param directoryPath - The path to the directory containing `.lsc` files.
 *
 * Logs an error if no `.lsc` files are found or if processing fails.
 */
export function LSCtoDDSAndPNG(directoryPath: string): void {
  try {
    // Find `.lsc` files in the directory
    const match = /\.lsc$/i;
    const files = readdirSync(directoryPath).filter((file) => match.test(file));

    if (files.length === 0) {
      console.error("No `.lsc` files found in the specified directory.");
      return;
    }

    // Process the `.lsc` file
    const inputFileName = files[0];
    const inputFilePath = join(directoryPath, inputFileName);
    console.log(`Processed File: ${inputFileName}`);

    //output to .dds
    const outputFileNameDDS = inputFileName.replace(/\.lsc$/i, ".dds");
    const outputFilePathDDS = join(directoryPath, outputFileNameDDS);

    const data = readFileSync(inputFilePath);
    const transformedBytes = TransformBytes(Uint8Array.from(data));

    writeFileSync(outputFilePathDDS, Buffer.from(transformedBytes), {
      encoding: "binary",
    });

    console.log(`Written File: ${outputFilePathDDS}`);

    //output to .png
    const outputPngPath = outputFilePathDDS.replace(/\.dds$/i, ".png");
    convertDdsToPng(outputFilePathDDS, outputPngPath);

    console.log(`Written File: ${outputPngPath}`);
  } catch (error) {
    console.error(
      `Error processing files in directory "${directoryPath}":`,
      error
    );
  }
}
