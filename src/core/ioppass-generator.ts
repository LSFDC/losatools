const MAX_PASSWORD = 20;
let result: number[] = [];

export default function EncryptDecryptData(
  szResultData: Buffer,
  iResultSize: number,
  szSourceData: Buffer,
  iSourceSize: number,
  bPassword: boolean
) {
  const MAX_KEY = 30;
  const byKey = [
    [
      255, 1, 2, 9, 89, 32, 123, 39, 34, 211, 222, 244, 100, 129, 23, 1, 4, 3,
      29, 30, 1, 4, 5, 7, 8, 233, 89, 1, 98, 67, 48, 29, 96, 1, 9, 48, 57, 213,
      178, 123, 67, 90, 2, 4, 254, 255, 6, 8, 9, 23, 90, 44, 214, 199, 108, 119,
      3, 2, 2,
    ],
    [
      255, 1, 2, 9, 89, 32, 123, 39, 34, 211, 222, 244, 100, 129, 23, 1, 4, 3,
      29, 30, 1, 4, 5, 7, 8, 233, 89, 1, 98, 67, 48, 29, 96, 1, 9, 48, 57, 213,
      178, 123, 67, 90, 2, 4, 254, 255, 6, 8, 9, 23, 90, 44, 214, 199, 108, 119,
      3, 2, 2,
    ],
  ];
  let iKeyType = 0;
  if (!bPassword) {
    iKeyType = 1;
  }

  for (let i = 0; i < iSourceSize; i++) {
    if (i >= iResultSize) {
      break;
    }
    szResultData[i] = szSourceData[i] ^ byKey[iKeyType][i % MAX_KEY];
    szResultData[i] =
      szResultData[i] ^ byKey[iKeyType][(iSourceSize - i) % MAX_KEY];
  }
}

export function EncryptPassword(szPassword: string) {
  result = [];
  let szPass = szPassword;
  let pBuf = Buffer.alloc(MAX_PASSWORD);
  pBuf.write(szPass);

  EncryptDecryptData(pBuf, pBuf.length, pBuf, pBuf.length, true);

  for (let i = 0; i < pBuf.length; i++) {
    let code = pBuf[i];
    if (code > 127) {
      code -= 256;
    }
    result.push(code);
  }
  return result.join(",");
}

export function DecryptPassword(szResult: string): string {
  const result = szResult.split(",").map((x) => parseInt(x, 10));
  const szEncPassWord = Buffer.from(result);
  const szPassword = Buffer.alloc(MAX_PASSWORD);
  const iSize = szPassword.length;

  EncryptDecryptData(
    szPassword,
    iSize,
    szEncPassWord,
    szEncPassWord.length,
    true
  );

  return szPassword.toString().replace(/\0/g, "");
}
