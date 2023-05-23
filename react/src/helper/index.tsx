export const newLineToBrElement = (
  text: string,
  separatorRegExp = /(<br\s*\/?>|\n)/
) => {
  return text.split(separatorRegExp).map((line, index) => {
    return line.match(separatorRegExp) ? <br key={index} /> : line;
  });
};
