# Losa Tools External
### Present by Lost Saga For Developer

## Tech Stack:
- NodeJS v20^
- Typescript
- ImageMagick

## List core of tools :
- DDS Parser
- UIXMLParser + Separate as Image with PNG format based on Layout & Position from XML
- Image Downloader
- INILoader
- MeshConverter (soon)
- ANI Converter (soon)

## Notes : 
- The ImageMagick binary is included in the "Addon" folder. Alternatively, you can download it from the official website: https://imagemagick.org/script/download.php or, for Windows users, https://imagemagick.org/script/download.php#windows.
- We hope this tool proves to be useful.
- We encourage users to contribute improvements to this tool in the future.


## How to :
- Download NodeJS and ImageMagick
- Clone this repository
- Open the clone repository witih your IDE (vscode/cursor/etc.)
- Edit `const resourcesPath = "";` `const configPath = "";`
  `const outputDir = "./output/";` on `src/index.ts`
- Run `npm install` to install dependencies
- Run `npm run all` to run main function.

## License
We used GPLv3 as core License