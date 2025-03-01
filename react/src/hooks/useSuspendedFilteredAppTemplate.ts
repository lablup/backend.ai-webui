import { useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';
import _ from 'lodash';

export type TemplateItem = {
  category: string;
  name: string;
  redirect: string;
  src: string;
  title: string;
};

export type AppTemplate = {
  [key: string]: TemplateItem[];
};

export type ServicePort = {
  container_ports: number[];
  host_ports: number[];
  is_inference: boolean;
  name: string;
  protocol: string;
};

export const useSuspendedFilteredAppTemplate = (
  servicePorts?: ServicePort[] | null,
) => {
  const baiClient = useSuspendedBackendaiClient();
  const { data: appTemplate = {} } = useSuspenseTanQuery<AppTemplate>({
    queryKey: ['backendai-app-template'],
    queryFn: () => {
      return fetch('resources/app_template.json')
        .then((res) => res.json())
        .then((res) => res.appTemplate);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const preOpenAppList = _.filter(
    servicePorts,
    (app) => app.protocol === 'preopen' && app.is_inference === false,
  );
  const preOpenAppTemplate = _.map(preOpenAppList, (app) => {
    return {
      name: app.name,
      title: app.name,
      // TODO: change image according to the connected app.
      src: '/resources/icons/default_app.svg',
    };
  });
  const inferenceAppList = _.filter(servicePorts, (app) => app.is_inference);
  const inferenceAppTemplate = _.map(inferenceAppList, (app) => {
    return {
      name: app.name,
      title: app.name,
      src: '/resources/icons/default_app.svg',
    };
  });
  const baseAppList = _.filter(
    servicePorts,
    (app) =>
      !_.includes(preOpenAppList, app) && !_.includes(inferenceAppList, app),
  );
  let baseAppTemplate = _.chain(baseAppList)
    .map((app) => {
      const template = _.find(
        _.flatten(Object.values(appTemplate)),
        (item) => item.name === app.name,
      );

      if (!_.includes(preOpenAppList, app) && !app.is_inference) {
        return {
          name: app.name,
          title: template?.title || app.name,
          category: template?.category || '0.Default',
          redirect: template?.redirect || '',
          src: template?.src || './resources/icons/default_app.svg',
        };
      }
      return null;
    })
    .filter(Boolean)
    .value();

  if (!_.some(baseAppList, { name: 'ttyd' })) {
    baseAppTemplate.push({
      name: appTemplate['ttyd'][0].name,
      title: appTemplate['ttyd'][0].title,
      category: '0.Default',
      redirect: appTemplate['ttyd'][0].redirect,
      src: appTemplate['ttyd'][0].src,
    });
  }

  const allowTCPApps =
    // @ts-ignore
    globalThis.isElectron || baiClient._config.allowNonAuthTCP;

  if (baiClient.supports('local-vscode-remote-connection') && allowTCPApps) {
    baseAppTemplate.push({
      name: 'vscode-desktop',
      title: 'Visual Studio Code (Desktop)',
      category: '2.Development',
      redirect: '',
      src: './resources/icons/vscode.svg',
    });
  }
  const groupedBaseAppTemplate = _.chain(baseAppTemplate)
    .sortBy('category')
    .groupBy('category')
    .value();

  return {
    appTemplate,
    preOpenAppTemplate,
    inferenceAppTemplate,
    baseAppTemplate: groupedBaseAppTemplate,
  };
};
