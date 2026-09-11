import { preserveDotStartCase } from '../helper';
import BAIImageMetaRow from './BAIImageMetaRow';
import { imageNodeTagFacts, imageTagFacts } from './BAIImageTagBadges';
import { BAIMetaDataProvider } from './provider';
import type { ImageMetaData } from './provider';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const FULL_NAME =
  'cr.backend.ai/stable/python-tensorflow:2.15-py39-cuda12.4-ubuntu20.04@x86_64';

const imageMetaData: ImageMetaData = {
  imageInfo: {
    'python-tensorflow': {
      name: 'TensorFlow',
      description: '',
      group: '',
      tags: [],
      icon: 'tensorflow.svg',
    },
  },
  tagAlias: { 'python-tensorflow': 'TensorFlow', py3: 'Python' },
  tagReplace: {},
};

const tagAlias = (tag: string) =>
  imageMetaData.tagAlias[tag] ?? preserveDotStartCase(tag);

const renderRow = (ui: React.ReactNode) =>
  render(
    <BAIMetaDataProvider imageMetaData={imageMetaData} imagePath="icons">
      {ui}
    </BAIMetaDataProvider>,
  );

describe('BAIImageMetaRow', () => {
  it('derives name, version and architecture from fullName alone', () => {
    renderRow(<BAIImageMetaRow fullName={FULL_NAME} />);

    expect(screen.getByText('TensorFlow')).toBeInTheDocument();
    expect(screen.getByText('2.15')).toBeInTheDocument();
    expect(screen.getByText('x86_64')).toBeInTheDocument();
  });

  it('prefers the parts the caller passes over the derived ones', () => {
    renderRow(
      <BAIImageMetaRow
        fullName={FULL_NAME}
        name="Ngc Pytorch"
        version="26.03"
        architecture="aarch64"
      />,
    );

    expect(screen.getByText('Ngc Pytorch')).toBeInTheDocument();
    expect(screen.getByText('26.03')).toBeInTheDocument();
    expect(screen.getByText('aarch64')).toBeInTheDocument();
    expect(screen.queryByText('x86_64')).not.toBeInTheDocument();
  });

  // The image fields are `@since(version: "24.12.0")` and arrive null on an
  // older manager, so an empty override must not blank the part out.
  it('falls back to the derived part when an override is empty', () => {
    renderRow(
      <BAIImageMetaRow
        fullName={FULL_NAME}
        name=""
        version=""
        architecture=""
      />,
    );

    expect(screen.getByText('TensorFlow')).toBeInTheDocument();
    expect(screen.getByText('2.15')).toBeInTheDocument();
    expect(screen.getByText('x86_64')).toBeInTheDocument();
  });

  it('renders the tag chips only for the full variant', () => {
    // `py3` has its own alias but `py39` does not, so the chip stays a
    // two-part double tag rather than collapsing into one badge.
    const tags = imageTagFacts([{ key: 'py3', value: '9' }], tagAlias);

    const { unmount } = renderRow(
      <BAIImageMetaRow fullName={FULL_NAME} tags={tags} />,
    );
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    unmount();

    renderRow(
      <BAIImageMetaRow fullName={FULL_NAME} variant="compact" tags={tags} />,
    );
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('takes a customized image name from the labels', () => {
    const tags = imageNodeTagFacts(
      [{ key: 'customized_abc', value: 'deadbeef' }],
      [{ key: 'ai.backend.customized-image.name', value: 'my-image' }],
      tagAlias,
    );

    renderRow(<BAIImageMetaRow fullName={FULL_NAME} tags={tags} />);

    expect(screen.getByText('my-image')).toBeInTheDocument();
    expect(screen.queryByText('deadbeef')).not.toBeInTheDocument();
  });

  it('renders the path variant as the raw reference in monospace', () => {
    const { container } = renderRow(
      <BAIImageMetaRow fullName={FULL_NAME} variant="path" />,
    );

    expect(screen.getByText(FULL_NAME)).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.queryByText('TensorFlow')).not.toBeInTheDocument();
  });

  it('drops the copy control when copyable is false', () => {
    const { unmount } = renderRow(<BAIImageMetaRow fullName={FULL_NAME} />);
    const withCopy = screen.getAllByRole('button').length;
    unmount();

    renderRow(<BAIImageMetaRow fullName={FULL_NAME} copyable={false} />);
    expect(screen.queryAllByRole('button')).toHaveLength(withCopy - 1);
  });
});
