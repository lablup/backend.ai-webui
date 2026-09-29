import BAIImageMetaIcon from './BAIImageMetaIcon';
import { BAIMetaDataProvider } from './provider';
import type { ImageMetaData } from './provider';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

const imageMetaData: ImageMetaData = {
  imageInfo: {
    python: { name: 'Python', description: '', group: '', tags: [] },
    tensorflow: {
      name: 'TensorFlow',
      description: '',
      group: '',
      tags: [],
      icon: 'tensorflow.svg',
    },
  },
  tagAlias: {},
  tagReplace: {},
};

const renderIcon = (image: string) =>
  render(
    <BAIMetaDataProvider imageMetaData={imageMetaData} imagePath="icons">
      <BAIImageMetaIcon image={image} />
    </BAIMetaDataProvider>,
  );

describe('BAIImageMetaIcon', () => {
  it('renders the declared vendor icon as an <img>', () => {
    const { container } = renderIcon('cr.backend.ai/x/tensorflow:2.0');

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'icons/tensorflow.svg',
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  // FR-3587: the raster fallback was fixed dark ink and disappeared in dark
  // mode, so an image with no declared icon renders a themed glyph instead.
  it('renders a themed glyph instead of the raster fallback', () => {
    const { container } = renderIcon('cr.backend.ai/x/python:3.9');

    expect(container.querySelector('img')).not.toBeInTheDocument();
    const glyph = container.querySelector('svg');
    expect(glyph).toBeInTheDocument();
    expect(glyph).toHaveStyle({ color: 'var(--color-text-primary)' });
  });

  it('renders nothing without an imagePath', () => {
    const { container } = render(
      <BAIMetaDataProvider imageMetaData={imageMetaData}>
        <BAIImageMetaIcon image="cr.backend.ai/x/python:3.9" />
      </BAIMetaDataProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
