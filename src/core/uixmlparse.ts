import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { XMLParser } from "fast-xml-parser";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

interface Image {
  Name: string;
  X?: number;
  Y?: number;
  Width: number;
  Height: number;
  OffsetX?: number;
  OffsetY?: number;
}

interface Imageset {
  Name: string;
  File: string;
  Images: Image[];
}

interface ImagesetLayout {
  Imageset: Imageset[];
}

/**
 * Writes a message to a log file.
 *
 * @param message The message to be written to the log file.
 * @param filename The name of the log file to be written to.
 *
 * The log message will be prefixed with the current date and time in ISO format.
 * If the log directory does not exist, it will be created.
 * The log file will be created if it does not exist, or appended to if it does.
 */
function WriteLog(message: string, filename: string) {
  const logDirPath = "./log";
  const logFilePath = path.join(logDirPath, filename);

  if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFilePath, logMessage, "utf8");
}

/**
 * Parses a UI XML file and extracts its contents into an ImagesetLayout object.
 *
 * @param filePath - The path to the UI XML file to be parsed.
 * @returns An ImagesetLayout object containing the parsed contents of the UI XML file.
 */
export function parseXml(filePath: string): ImagesetLayout {
  const xmlData = fs.readFileSync(filePath, "utf-8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: false,
  });

  const jsonObj = parser.parse(xmlData);

  const imagesetLayout: ImagesetLayout = {
    Imageset: (Array.isArray(jsonObj.ImagesetLayout.Imageset)
      ? jsonObj.ImagesetLayout.Imageset
      : [jsonObj.ImagesetLayout.Imageset]
    ).map((imageset: any) => {
      WriteLog("Processing Imageset: " + imageset.Name, "./xml.log");

      return {
        Name: imageset?.Name,
        File: imageset.File,
        Images: (Array.isArray(imageset.Image)
          ? imageset.Image
          : [imageset.Image]
        )
          .map((image: any) => {
            // Skip images with missing properties
            if (
              !image ||
              !image.X ||
              !image.Y ||
              !image.Width ||
              !image.Height
            ) {
              WriteLog(
                "Skipping image due to missing properties: " + image,
                "./error.log"
              );

              return null;
            }

            WriteLog("Processing Image: " + image, "./xml.log");

            return {
              Name: image?.Name,
              X: Number(image.X),
              Y: Number(image.Y),
              Width: Number(image.Width),
              Height: Number(image.Height),
              OffsetX: Number(image.OffsetX),
              OffsetY: Number(image.OffsetY),
            };
          })
          .filter((image: any) => image !== null),
      };
    }),
  };

  WriteLog("Final Imageset Layout: " + imagesetLayout, "./xml.log");

  return imagesetLayout;
}

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
async function convertDdsToPng(
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

/**
 * Extracts individual images from a UI XML imageset and saves them as PNG files.
 *
 * @param imageset - The imageset from the UI XML file.
 * @param outputDir - The directory where the extracted PNG files will be saved.
 * @returns A Promise that resolves when all images have been extracted and saved.
 *
 * The function first checks if the input file exists and is a valid file. If the
 * file is a DDS file, it is converted to a PNG file using the convertDdsToPng
 * function. If the file is a BMP file, it is processed as is.
 *
 * The function then iterates over the images in the imageset and extracts each
 * image from the input file using the sharp library. The extracted image is
 * saved as a PNG file in the output directory with the same name as the image
 * name in the imageset.
 */
export async function extractImages(
  imageset: Imageset,
  outputDir: string
): Promise<void> {
  const inputFilePath = path.resolve(imageset.File);

  if (!fs.existsSync(inputFilePath)) {
    WriteLog(`File not found: ${inputFilePath}`, "./error.log");
    return;
  }

  // Get file extension
  const ext = path.extname(inputFilePath).toLowerCase();

  let imagePath = inputFilePath;

  if (ext === ".dds") {
    const tempPngPath = path.resolve(outputDir, `${imageset.Name}.png`);
    await convertDdsToPng(inputFilePath, tempPngPath);
    imagePath = tempPngPath;
  }

  if (ext === ".bmp") {
    imagePath = inputFilePath;
  }

  // Process images
  for (const image of imageset.Images) {
    const outputFilePath = path.resolve(outputDir, `${image.Name}.png`);

    WriteLog(
      `Extracting ${image.Name} from ${inputFilePath} to ${outputFilePath} \r\n
      X: ${image.X}, Y: ${image.Y}, Width: ${image.Width}, Height: ${image.Height}`,
      "./debug.log"
    );

    try {
      await sharp(imagePath)
        .extract({
          left: image.X ?? 0,
          top: image.Y ?? 0,
          width: image.Width,
          height: image.Height,
        })
        .toFormat("png")
        .toFile(outputFilePath);

      WriteLog(`Saved: ${outputFilePath}`, "./debug.log");
    } catch (err) {
      WriteLog(`Failed to extract ${image.Name}: ${err}`, "./error.log");
    }
  }
}
