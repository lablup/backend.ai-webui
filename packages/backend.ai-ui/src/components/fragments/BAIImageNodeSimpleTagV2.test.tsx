import { preserveDotStartCase } from '../../helper';
import { imageNodeTagFacts } from './BAIImageNodeSimpleTagV2';

const aliases: Record<string, string> = {
  'python-tensorflow': 'TensorFlow',
  py3: 'Python',
};
const tagAlias = (tag: string) => aliases[tag] ?? preserveDotStartCase(tag);

describe('imageNodeTagFacts', () => {
  // `py3` has its own alias but `py39` does not, so the token stays a two-part
  // double tag rather than collapsing into one badge.
  it('keeps a tag as a double tag when only its key has an alias', () => {
    const [fact] = imageNodeTagFacts(
      [{ key: 'py3', value: '9' }],
      [],
      tagAlias,
    );

    expect(fact.isDouble).toBe(true);
    expect(fact.keyAlias).toBe('Python');
    expect(fact.value).toBe('9');
  });

  // A v1 tag value is nullable; `key + undefined` would look up
  // `tensorflowundefined` and flip an exactly-aliased tag to a double tag.
  it('treats a null tag value as an empty one', () => {
    const [fact] = imageNodeTagFacts(
      [{ key: 'py3', value: null }],
      [],
      tagAlias,
    );

    expect(fact.aliasedTag).toBe('Python');
    expect(fact.isDouble).toBe(false);
  });

  it('takes a customized image name from the labels', () => {
    const [fact] = imageNodeTagFacts(
      [{ key: 'customized_abc', value: 'deadbeef' }],
      [{ key: 'ai.backend.customized-image.name', value: 'my-image' }],
      tagAlias,
    );

    expect(fact.isCustomized).toBe(true);
    expect(fact.isDouble).toBe(true);
    expect(fact.value).toBe('my-image');
  });

  it('drops a tag with no key', () => {
    expect(
      imageNodeTagFacts([{ key: '', value: 'x' }, null], [], tagAlias),
    ).toHaveLength(0);
  });
});
