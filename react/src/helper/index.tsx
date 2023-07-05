export const newLineToBrElement = (
  text: string,
  separatorRegExp = /(<br\s*\/?>|\n)/
) => {
  return text.split(separatorRegExp).map((line, index) => {
    return line.match(separatorRegExp) ? <br key={index} /> : line;
  });
};

export const baiSignedRequestWithPromise = ({
  method,
  url,
  body = null,
  client,
}: {
  method: string;
  url: string;
  body?: any;
  client: any;
}) => {
  let request = client?.newSignedRequest(method, url, body, null);
  return client?._wrapWithPromise(request);
};

/**
 * Convert file size with binary unit to human readable unit and value
 *
 * @param {number} bytes
 * @param {number} decimalPoint decimal point set to 2 as a default
 * @return {string} converted file size to human readable value
 */
export const _humanReadableDecimalSize = (bytes = 0, decimalPoint = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = Math.pow(10, 3);
  decimalPoint = decimalPoint < 0 ? 0 : decimalPoint;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  let i = Math.floor(Math.log(Math.round(bytes)) / Math.log(k));
  i = i < 0 ? 0 : i; // avoid negative value
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + " " + sizes[i]
  );
};

export const _humanReadableBinarySize = (
  bytes = 0,
  decimalPoint = 2,
  compact = false
) => {
  if (!bytes) return 0;
  if (typeof bytes === "string") bytes = parseInt(bytes);
  const k = Math.pow(2, 10);
  let i;
  let unitList;
  decimalPoint = decimalPoint < 0 || compact ? 0 : decimalPoint;
  i = Math.floor(Math.log(Math.round(bytes)) / Math.log(k));
  i = i < 0 ? 0 : i; // avoid negative value
  if (compact) {
    unitList = ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei"];
  } else {
    unitList = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
  }
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) +
    " " +
    unitList[i]
  );
};

export const GBToBytes = (value = 0) => {
  const gigabyte = Math.pow(10, 9);
  return Math.round(gigabyte * value);
};

export const bytesToGB = (
  bytes: number,
  decimalPoint = 2,
  nullStr: string = ""
) => {
  if (bytes === null || bytes === undefined) return nullStr;
  if (!bytes) return bytes;
  return (bytes / 10 ** 9).toFixed(decimalPoint);
};

export type QuotaScopeType = "project" | "user";
export const addQuotaScopeTypePrefix = (type: QuotaScopeType, str: string) => {
  if (str === "" || str === undefined) return "";
  if (str.startsWith(`${type}:`)) return str;
  return `${type}:${str}`;
};
