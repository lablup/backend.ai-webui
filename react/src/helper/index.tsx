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
  let request = client.newSignedRequest(method, url, body, null);
  return client._wrapWithPromise(request);
};
