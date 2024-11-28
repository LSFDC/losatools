import { exec } from "child_process";
import util from "util";
import { WriteLog } from "./logger";
const execPromise = util.promisify(exec);

/**
 * Converts a DDS file to a PNG file using ImageMagick.
 *
 * @param inputFile - The path to the input DDS file.
 * @param outputFile - The path to the output PNG file.
 *
 * This function executes the ImageMagick command `magick convert` to convert the
 * input file to a PNG. If the command executes successfully, a log message is
 * written. If the command fails, a log message is written and the error is
 * re-thrown.
 */
export async function convertDdsToPng(
  inputFile: string,
  outputFile: string
): Promise<void> {
  try {
    const command = `magick convert "${inputFile}" "${outputFile}"`;

    WriteLog("Executing command: " + command, "./debug.log");

    await execPromise(command);

    WriteLog(`Converted: ${inputFile} to ${outputFile}`, "./debug.log");
  } catch (error) {
    WriteLog(`Failed to convert ${inputFile}:`, "./error.log");

    throw error;
  }
}
