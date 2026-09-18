import { BAIMetaDataProvider } from '../provider';
import type { ImageMetaData } from '../provider';
import ImageNodeSimpleTag, {
  type ImageNodeSimpleTagProps,
} from './ImageNodeSimpleTag';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const imageMetaData: ImageMetaData = {
  imageInfo: {},
  tagAlias: {},
  tagReplace: {},
};

const facts: ImageNodeSimpleTagProps['facts'] = [
  {
    key: 'py3',
    value: '9',
    isCustomized: false,
    aliasedTag: 'Py39',
    isDouble: true,
    keyAlias: 'Python',
  },
  {
    key: 'ubuntu',
    value: '20.04',
    isCustomized: false,
    aliasedTag: 'Ubuntu 20.04',
    isDouble: false,
  },
];

const renderRow = (props: Partial<ImageNodeSimpleTagProps> = {}) =>
  render(
    <BAIMetaDataProvider imageMetaData={imageMetaData}>
      <ImageNodeSimpleTag
        fullName="cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64"
        name="Python"
        version="3.9"
        architecture="x86_64"
        facts={facts}
        {...props}
      />
    </BAIMetaDataProvider>,
  );

describe('ImageNodeSimpleTag', () => {
  it('draws the three parts, a double token and a single token', () => {
    const { container } = renderRow();

    // Image tags are settled values, so every chip is a Token (ADR 0007).
    expect(container.querySelectorAll('.astryx-token')).toHaveLength(3);
    expect(container.querySelector('.astryx-badge')).not.toBeInTheDocument();

    expect(screen.getByText('3.9')).toBeInTheDocument();
    expect(screen.getByText('x86_64')).toBeInTheDocument();
    // `Python` is both the base name and the double token's key alias.
    expect(screen.getAllByText('Python')).toHaveLength(2);
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Ubuntu 20.04')).toBeInTheDocument();
    expect(container.querySelector('.bai-text-copy')).toBeInTheDocument();
  });

  it('drops the tokens with withoutTag', () => {
    renderRow({ withoutTag: true });

    expect(screen.getAllByText('Python')).toHaveLength(1);
    expect(screen.queryByText('Ubuntu 20.04')).not.toBeInTheDocument();
  });

  it('drops the copy control with copyable={false}', () => {
    const { container } = renderRow({ copyable: false });

    expect(container.querySelector('.bai-text-copy')).not.toBeInTheDocument();
  });
});
