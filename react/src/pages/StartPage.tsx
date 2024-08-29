import BAIStartBasicCard from '../components/BAIStartBasicCard';
import Flex from '../components/Flex';
import BatchSessionIcon from '../components/icons/BatchSessionIcon';
import ExampleStartIcon from '../components/icons/ExampleStart';
import InteractiveSessionIcon from '../components/icons/InteractiveSession';
import ModelServiceIcon from '../components/icons/ModelServiceIcon';
import URLStartIcon from '../components/icons/URLStartIcon';
import { useWebUINavigate } from '../hooks';
import { FolderAddOutlined } from '@ant-design/icons';
import React from 'react';

interface StartPageProps {}

const StartPage: React.FC<StartPageProps> = (props) => {
  const webuiNavigate = useWebUINavigate();

  return (
    <Flex gap={16} wrap="wrap" direction="column" align="start">
      <Flex gap={16} wrap="wrap">
        <BAIStartBasicCard
          icon={<FolderAddOutlined />}
          title={
            <div>
              Create a New
              <br />
              Storage Folder
            </div>
          }
          description="Creating a folder and uploading files are crucial for training models or providing services externally. Please begin by uploading the files."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/data');
            },
            children: 'Create Folder',
          }}
        />
        <BAIStartBasicCard
          icon={<InteractiveSessionIcon />}
          title={
            <div>
              Start an
              <br />
              Interactive Session
            </div>
          }
          description="Want to train a model? Click the button to create a session instantly. Choose your preferred environment and resources for running code and other tasks."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/session/start');
            },
            children: 'Start Session',
          }}
        />
        <BAIStartBasicCard
          icon={<BatchSessionIcon />}
          title={
            <div>
              Start a<br />
              Batch Session
            </div>
          }
          description="For predefined files or scheduled tasks, try Batch sessions. Enter the command, set the date and time, and run as needed."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate(
                '/session/start?formValues=%7B%22sessionType%22%3A%22batch%22%2C%22environments%22%3A%7B%22environment%22%3A%22cr.backend.ai%2Fmultiarch%2Fpython%22%2C%22version%22%3A%22cr.backend.ai%2Fmultiarch%2Fpython%3A3.9-ubuntu20.04%40x86_64%22%7D%2C%22envvars%22%3A%5B%5D%2C%22resourceGroup%22%3A%22default%22%2C%22allocationPreset%22%3A%22cpu01-small%22%2C%22resource%22%3A%7B%22cpu%22%3A1%2C%22mem%22%3A%221G%22%2C%22shmem%22%3A%2264m%22%2C%22accelerator%22%3A0%7D%2C%22enabledAutomaticShmem%22%3Atrue%2C%22num_of_sessions%22%3A1%2C%22cluster_mode%22%3A%22single-node%22%2C%22cluster_size%22%3A1%2C%22hpcOptimization%22%3A%7B%22autoEnabled%22%3Atrue%2C%22OMP_NUM_THREADS%22%3A%221%22%2C%22OPENBLAS_NUM_THREADS%22%3A%221%22%7D%2C%22vfoldersAliasMap%22%3A%7B%7D%2C%22batch%22%3A%7B%22enabled%22%3Afalse%7D%7D',
              );
            },
            children: 'Start Session',
          }}
        />
      </Flex>
      <Flex gap={16} wrap="wrap">
        <BAIStartBasicCard
          secondary
          icon={<ModelServiceIcon />}
          title={
            <div>
              Start a
              <br /> Model Service
            </div>
          }
          description="Ready to share your trained model with others? Click the button to create a service."
          footerButtonProps={{
            onClick: () => {
              webuiNavigate('/serving');
            },
            children: 'Start Service',
          }}
        />
        <BAIStartBasicCard
          secondary
          icon={<ExampleStartIcon />}
          title={
            <div>
              Start
              <br />
              from the Example
            </div>
          }
          description="Explore various example codes and get started."
          footerButtonProps={{
            children: 'Start Now',
          }}
        />
        <BAIStartBasicCard
          secondary
          icon={
            // FIXME: workaround for displaying proper icon
            <img
              src="react/src/components/icons/URLStart.svg"
              alt="URL start"
            ></img>
            // <URLStartIcon />
          }
          title={
            <div>
              Start
              <br />
              from a URL
            </div>
          }
          description="Import your project and code from various environments such as GitHub, GitLab, Notebook, etc."
          footerButtonProps={{
            children: 'Start Now',
          }}
        />
      </Flex>
      {/* <BAIStartSimpleCard
        icon={<SessionsIcon />}
        title={'Create a Session'}
        footerButtonProps={{
          onClick: () => {
            webuiNavigate('/session/start');
          },
          children: 'Start Session',
        }}
      /> */}
    </Flex>
  );
};
export default StartPage;
