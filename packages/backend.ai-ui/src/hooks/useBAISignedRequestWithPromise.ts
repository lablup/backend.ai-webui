import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';

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
  const request = client?.newSignedRequest(method, url, body, null);
  return client?._wrapWithPromise(request);
};

export const useBAISignedRequestWithPromise = () => {
  const baliClient = useConnectedBAIClient();
  return ({
    method,
    url,
    body = null,
  }: {
    method: string;
    url: string;
    body?: any;
  }) =>
    baiSignedRequestWithPromise({
      method,
      url,
      body,
      client: baliClient,
    });
};
