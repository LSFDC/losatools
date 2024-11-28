import https from "https";
import fs from "fs";

/**
 * Downloads an image from a given URL and saves it to the specified file path.
 *
 * @param url - The URL of the image to be downloaded.
 * @param outputFilePath - The local file path where the downloaded image will be saved.
 * @returns A Promise that resolves when the download is complete and the image is saved, or rejects with an error if the download fails.
 */
function downloadImage(url: string, outputFilePath: string) {
  return new Promise<void>((resolve, reject) => {
    console.log(`Starting download from ${url}...`);

    https
      .get(url, (response: any) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          response.resume();
          return;
        }

        const fileStream = fs.createWriteStream(outputFilePath);

        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close(() => {
            console.log(`Image saved to ${outputFilePath}`);
            resolve();
          });
        });

        fileStream.on("error", (err: any) => {
          fs.unlink(outputFilePath, () => reject(err));
        });
      })
      .on("error", (err: any) => {
        reject(err);
      });
  });
}

export default downloadImage;
