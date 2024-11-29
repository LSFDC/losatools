import parseDDS from "./core/dds-parser";
import * as fs from "fs";
import { extractImages, parseXml } from "./core/uixmlparse";
import downloadImage from "./core/image-downloader";
import INILoader from "./core/ini-loader";
import {
  ConvertServerIDToAddress,
  ConvertToGameServerID,
} from "./core/serverid-generator";
import { DecryptPassword, EncryptPassword } from "./core/ioppass-generator";
import { LSCtoDDSAndPNG } from "./core/lsc-converter";

/**
 * Main function that runs the dds parser, uixmlparser, image downloader, and ini-loader.
 * This function is the entry point of the program.
 */
async function main() {
  // const resourcesPath = "";
  // const configPath = "";
  // const outputDir = "./output/";
  // const xmlFilePath = ""; //find uiimageset.xml path

  // //dds parser
  // console.log("Parsing DDS file...");
  // const ddsHeader = parseDDS(`${resourcesPath}/example_icon.dds`);
  // console.log(`Width: ${ddsHeader.width}, Height: ${ddsHeader.height}`);
  // console.log(`Pixel Format: ${ddsHeader.pixelFormat}`);
  // console.log("DDS parsing completed.");

  // //uixmlparser + convert image to separated png
  // console.log("Parsing UI XML file and extracting images...");

  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir);
  // }

  // const parsedData = parseXml(xmlFilePath);

  // for (const imageset of parsedData.Imageset) {
  //   if (!fs.existsSync(outputDir + imageset?.Name)) {
  //     fs.mkdirSync(outputDir + imageset?.Name);
  //   }
  //   imageset.File = resourcesPath + "/" + imageset?.File;
  //   console.log(`Processing Imageset: ${imageset?.Name}`);

  //   await extractImages(imageset, outputDir + imageset?.Name);
  // }

  // console.log("Parsing UI XML file and extracting images completed.");

  // //image downloader
  // console.log("Downloading images...");
  // const total = 260; //total number of mercenary images

  // for (let index = 1; index <= total; index++) {
  //   const paddedIndex = String(index).padStart(3, "0");

  //   // URL lists

  //   ///male
  //   const imageMaleUrl = `https://lostsagakr-cdn-image.valofe.com/2014_grand/class/illust/thum_char_view_n_${paddedIndex}.jpg`;
  //   const imageFemaleUrl = `https://lostsagakr-cdn-image.valofe.com/2014_grand/class/illust/thum_char_view_o_${paddedIndex}.jpg`;

  //   ///female
  //   const imageThumbMaleUrl = `https://lostsagakr-cdn-image.valofe.com/2014_grand/class/thum/thum_char_${paddedIndex}_n.jpg`;
  //   const imageThumbFemaleUrl = `https://lostsagakr-cdn-image.valofe.com/2014_grand/class/thum/thum_char_${paddedIndex}_o.jpg`;

  //   // Paths to save the images locally

  //   ///male
  //   const savePathMale = `${outputDir}mercenary/${paddedIndex}/${paddedIndex}_male.jpg`;
  //   const savePathFemale = `${outputDir}mercenary/${paddedIndex}/${paddedIndex}_female.jpg`;

  //   ///female
  //   const saveThumbPathMale = `${outputDir}mercenary/${paddedIndex}/${paddedIndex}_thumb_male.jpg`;
  //   const saveThumbFemale = `${outputDir}mercenary/${paddedIndex}/${paddedIndex}_thumb_female.jpg`;

  //   try {
  //     fs.mkdirSync(`${outputDir}mercenary/${paddedIndex}/`, {
  //       recursive: true,
  //     });

  //     console.log(`Downloading Thumbnail Male Image ${paddedIndex}...`);
  //     await downloadImage(imageThumbMaleUrl, saveThumbPathMale);

  //     console.log(`Downloading Male Image ${paddedIndex}...`);
  //     await downloadImage(imageMaleUrl, savePathMale);

  //     console.log(`Downloading Thumbnail Female Image ${paddedIndex}...`);
  //     await downloadImage(imageThumbFemaleUrl, saveThumbFemale);

  //     console.log(`Downloading Female Image ${paddedIndex}...`);
  //     await downloadImage(imageFemaleUrl, savePathFemale);
  //   } catch (error: any) {
  //     console.error(`Error downloading image ${paddedIndex}:`, error?.message);
  //   }
  // }
  // console.log("Downloading images completed.");

  // //ini-loader
  // console.log("Loading ini files...");
  // const iniLoader = new INILoader(`${configPath}/sp2.ini`, true);
  // iniLoader.setTitle("connect");
  // const value = iniLoader.loadString("log_server_ip", "");
  // console.log(value);
  // console.log("Loading ini files completed.");

  // //serverid generator
  // console.log("Generating server ID...");
  // const serverId = ConvertToGameServerID("127.0.0.1", 14009);
  // const { ip, port } = ConvertServerIDToAddress(serverId);
  // console.log(`Server ID: ${serverId}`);
  // console.log(`Server IP & Port: ${ip}:${port}`);
  // console.log("Generating server ID completed.");

  // //iop password generator
  // console.log("Generating iop password...");
  // //Encrypt Process
  // let resultEncrypt = "";
  // const password = "iosuccess#@";

  // //@ts-ignore
  // resultEncrypt = EncryptPassword(password);
  // console.log(`IOP Password: ${resultEncrypt}`);

  // //Decrypt Process
  // const decryptedPassword = resultEncrypt; // or use exist encrypted password put as string (example: "-86, 53, 59, 108, 105, 17, 42, -12, 44, 65, 111, 66, 108, -114, 10, 77, 110, 58, 43, 123") expect to be : T*$f40FRjfoe*(fl304d
  // let resultDecrypt = "";

  // //@ts-ignore
  // resultDecrypt = DecryptPassword(decryptedPassword);
  // console.log(`Decrypted IOP Password: ${resultDecrypt}`);

  // console.log("Generating iop password completed.");

  //lsc to DDS
  console.log("Converting LSC to DDS And PNG...");
  LSCtoDDSAndPNG("D:\\LostSaga\\Korea\\KR\\LostSaga\\resource\\texture"); //path to lsc files (example: D:\\LostSaga\\Korea\\KR\\LostSaga\\resource\\texture)
  console.log("Converting LSC to DDS completed.");
}

main().catch((err) => console.error(err));
