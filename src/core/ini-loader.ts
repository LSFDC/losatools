import * as fs from "fs";
import * as path from "path";

type DicKeyList = Record<string, string>;
type DicTitleList = Record<string, DicKeyList>;

class INILoader {
  private fileName: string = "";
  private currentTitle: string = "";
  private titleList: DicTitleList = {};
  private saveLog: boolean = false;
  private logStream: fs.WriteStream | null = null;

  /**
   * Initializes a new instance of the INILoader class.
   *
   * @param fileName - The name of the INI file to be loaded. If provided and the file exists, it is parsed.
   * @param saveLog - A boolean indicating whether logging should be enabled. If true, logs are saved to a file.
   *
   * The constructor checks if the given file exists. If it does, and logging is enabled, it creates a log directory
   * and a log file with the same base name as the provided file. The INI file is then parsed.
   */
  constructor(fileName: string = "", saveLog: boolean = false) {
    if (fileName && fs.existsSync(fileName)) {
      this.saveLog = saveLog;
      if (this.saveLog) {
        const logDir = path.join(__dirname, "../../log");
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        const logFileName = path.basename(fileName) + ".log";
        const logFilePath = path.join(logDir, logFileName);

        this.logStream = fs.createWriteStream(logFilePath, {
          flags: "w",
          encoding: "utf8",
        });
      }

      this.fileName = fileName;
      this.currentTitle = "";
      this.parseFile();
    }
  }

  /**
   * Sets the name of the INI file to be loaded and parses the file if it exists.
   *
   * @param fileName - The name of the INI file to be loaded. If the file exists, it is parsed.
   */
  setFileName(fileName: string): void {
    this.titleList = {};
    this.fileName = fileName;
    this.currentTitle = "";

    if (fs.existsSync(fileName)) {
      this.parseFile();
    } else {
      this.writeLog(`INI file does not exist: [${fileName}]`);
    }
  }

  /**
   * Gets the name of the INI file that is currently loaded.
   *
   * @returns The name of the INI file that is currently loaded.
   */
  getFileName(): string {
    return this.fileName;
  }

  /**
   * Parses the INI file specified in the constructor.
   *
   * It reads the file line by line, trims each line, and splits it into sections by looking for lines starting with "[".
   * Each section is further split into key-value pairs by looking for lines that do not start with ";", and
   * adding them to the current section's key list. When a new section is found, the current section's key list is
   * added to the title list and reset.
   *
   * After parsing all lines, the last section's key list is added to the title list if it is not empty.
   *
   * Logs are written to the log file if logging is enabled.
   */
  private parseFile(): void {
    this.writeLog(
      `<<< -------------------- ${this.fileName} Load -------------------- >>>`
    );

    const lines = fs.readFileSync(this.fileName, "utf8").split(/\r?\n/);
    let currentKeyList: DicKeyList = {};
    let lastLine: string = "";

    for (const line of lines) {
      const cleanLine = line.trim().replace("\t", "");
      if (!cleanLine) continue;

      if (cleanLine.startsWith("[")) {
        if (Object.keys(currentKeyList).length > 0) {
          this.addToTitleList(lastLine, currentKeyList);
          currentKeyList = {};
        }
        lastLine = cleanLine;
      } else if (!cleanLine.startsWith(";")) {
        this.parseKey(lastLine, cleanLine, currentKeyList);
      }
    }

    if (Object.keys(currentKeyList).length > 0) {
      this.addToTitleList(lastLine, currentKeyList);
    }

    this.writeLog(
      `<<< -------------------- ${this.fileName} Load Complete -------------------- >>>`
    );
    this.closeLog();
  }

  /**
   * Parses a line of text into a key-value pair and adds it to the given key list.
   *
   * @param title - The title of the section that this line belongs to.
   * @param line - The line of text to be parsed.
   * @param keyList - The key list to which the parsed key-value pair is added.
   *
   * The line is split into two parts by the first equals sign. The first part is
   * taken as the key, and the second part is taken as the value. The key and value
   * are trimmed of any leading or trailing whitespace. If the key is empty, or if
   * the key already exists in the key list, the key-value pair is not added to the
   * key list and a log message is written. Otherwise, the key-value pair is added to
   * the key list.
   */
  private parseKey(title: string, line: string, keyList: DicKeyList): void {
    const [key, value] = line.split("=", 2).map((s) => s.trim());
    if (key && value) {
      if (keyList[key]) {
        this.writeLog(`Duplicate key found: ${title} - ${key}`);
      } else {
        keyList[key] = value;
      }
    }
  }

  /**
   * Adds the given key list to the title list under the given title name.
   *
   * @param title - The title of the section that this key list belongs to. The
   *                title should be in the format "[section name]".
   * @param keyList - The key list to be added to the title list.
   *
   * If the title is in the correct format, the title name is extracted and the
   * key list is added to the title list under that name. If the section name
   * already exists in the title list, a log message is written and the key list
   * is not added. If the title is not in the correct format, a log message is
   * written and the key list is not added.
   */
  private addToTitleList(title: string, keyList: DicKeyList): void {
    const match = title.match(/\[(.+?)\]/);
    if (match) {
      const titleName = match[1];
      if (this.titleList[titleName]) {
        this.writeLog(`Duplicate section found: ${title}`);
      } else {
        this.titleList[titleName] = keyList;
      }
    } else {
      this.writeLog(`Unknown error with title: ${title}`);
    }
  }

  /**
   * Sets the current title section for the INI loader.
   *
   * @param section - The name of the section to set as the current title.
   */
  setTitle(section: string): void {
    this.currentTitle = section;
  }

  /**
   * Writes a key-value pair to the INI file specified in the constructor.
   *
   * @param key - The key to be written.
   * @param value - The value to be written.
   *
   * If the INI file name is not set or the current title is not set, this
   * function does nothing. Otherwise, it appends the key-value pair to the
   * INI file in the format "key=value\n".
   */
  writeValue(key: string, value: string): void {
    if (!this.fileName || !this.currentTitle) return;

    const content = `${key}=${value}\n`;
    fs.appendFileSync(this.fileName, content, "utf8");
  }

  /**
   * Returns the value associated with the given key from the current title section.
   *
   * If the current title is not set or if the key does not exist in the current title
   * section, an empty string is returned.
   *
   * @param key - The key to look up in the current title section.
   * @returns The value associated with the given key, or an empty string if not found.
   */
  getValue(key: string): string {
    if (!this.currentTitle) return "";

    const section = this.titleList[this.currentTitle];
    if (section && section[key]) {
      return section[key];
    }
    return "";
  }

  /**
   * Returns the value associated with the given key from the current title section,
   * or a default value if the key does not exist.
   *
   * @param key - The key to look up in the current title section.
   * @param defaultValue - The default value to return if the key does not exist.
   * @returns The value associated with the given key, or the default value if not found.
   */
  loadString(key: string, defaultValue: string): string {
    const value = this.getValue(key);
    return value || defaultValue;
  }

  /**
   * Returns the value associated with the given key from the current title section,
   * parsed as an integer, or a default value if the key does not exist.
   *
   * @param key - The key to look up in the current title section.
   * @param defaultValue - The default value to return if the key does not exist.
   * @returns The value associated with the given key, parsed as an integer, or the default value if not found.
   */
  loadInt(key: string, defaultValue: number): number {
    const value = this.getValue(key);
    return value ? parseInt(value, 10) : defaultValue;
  }

  /**
   * Returns the value associated with the given key from the current title section,
   * parsed as a float, or a default value if the key does not exist.
   *
   * @param key - The key to look up in the current title section.
   * @param defaultValue - The default value to return if the key does not exist.
   * @returns The value associated with the given key, parsed as a float, or the default value if not found.
   */
  loadFloat(key: string, defaultValue: number): number {
    const value = this.getValue(key);
    return value ? parseFloat(value) : defaultValue;
  }

  /**
   * Returns the value associated with the given key from the current title section,
   * parsed as a boolean, or a default value if the key does not exist.
   *
   * @param key - The key to look up in the current title section.
   * @param defaultValue - The default value to return if the key does not exist.
   * @returns The value associated with the given key, parsed as a boolean, or the default value if not found.
   */
  loadBool(key: string, defaultValue: boolean): boolean {
    const value = this.getValue(key);
    return value ? value === "1" : defaultValue;
  }

  /**
   * Writes a log message if log saving is enabled and a log stream is set.
   *
   * @param log - The log message to be written.
   */
  private writeLog(log: string): void {
    if (this.saveLog && this.logStream) {
      this.logStream.write(`${log}\n`);
    }
  }

  /**
   * Closes the log stream if log saving is enabled and a log stream is set.
   * This is called in the destructor of the class.
   */
  private closeLog(): void {
    if (this.saveLog && this.logStream) {
      this.logStream.end();
    }
  }
}

export default INILoader;
