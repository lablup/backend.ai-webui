/**
 * The image row `BAIImageNodeSimpleTag` and `BAIImageNodeSimpleTagV2` draw
 * once their fragment is read (ADR 0005): meta icon, aliased base name, base
 * version and architecture, then the tag tokens and a copy control for the full
 * reference. Internal — the barrel exports the two fragment readers, not this.
 */
import { theme } from '../../theme-shim';
import BAIDoubleToken from '../BAIDoubleToken';
import BAIFlex from '../BAIFlex';
import BAIImageMetaIcon from '../BAIImageMetaIcon';
import BAIText from '../BAIText';
import { Divider } from '@lablup/ui-common/Divider';
import { Text } from '@lablup/ui-common/Text';
import { Token } from '@lablup/ui-common/Token';
import * as _ from 'lodash-es';
import React from 'react';

/**
 * One rule for "how does a parsed image tag display" — every surface that
 * shows image tags reads these facts.
 */
export interface BAIImageTagFact {
  key: string;
  value?: string;
  isCustomized: boolean;
  aliasedTag: string;
  isDouble: boolean;
  keyAlias?: string;
}

/**
 * Astryx's vertical `Divider` is `height: 100%`, which a centered flex row
 * collapses to 0; these are antd's metrics.
 */
const MetaDivider: React.FC = () => {
  'use memo';
  const { token } = theme.useToken();
  return (
    <Divider
      orientation="vertical"
      style={{
        alignSelf: 'center',
        height: '0.9em',
        marginInline: token.marginXXS,
      }}
    />
  );
};

export interface ImageNodeSimpleTagProps {
  /** Full reference; the icon reads it and the copy control emits it. */
  fullName: string;
  /** Base image name, already aliased. */
  name: string;
  version?: string | null;
  architecture?: string | null;
  facts: ReadonlyArray<BAIImageTagFact>;
  withoutTag?: boolean;
  copyable?: boolean;
}

const ImageNodeSimpleTag: React.FC<ImageNodeSimpleTagProps> = ({
  fullName,
  name,
  version,
  architecture,
  facts,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  return (
    <BAIFlex direction="row" wrap="wrap" gap="xxs">
      <BAIImageMetaIcon image={fullName} />
      <Text>{name}</Text>
      <MetaDivider />
      <Text>{version}</Text>
      <MetaDivider />
      <Text>{architecture}</Text>
      {!withoutTag && !_.isEmpty(facts) ? (
        <>
          <MetaDivider />
          <BAIFlex direction="row" align="center" gap="xxs" wrap="wrap">
            {_.map(facts, (fact, index) =>
              fact.isDouble ? (
                <BAIDoubleToken
                  key={`${fact.key}-${index}`}
                  values={[
                    {
                      label: fact.keyAlias ?? '',
                      color: fact.isCustomized ? 'cyan' : 'blue',
                    },
                    {
                      label: fact.value ?? '',
                      color: fact.isCustomized ? 'cyan' : 'blue',
                    },
                  ]}
                />
              ) : (
                <Token
                  key={`${fact.key}-${index}`}
                  color={fact.isCustomized ? 'cyan' : 'blue'}
                  label={fact.aliasedTag}
                />
              ),
            )}
          </BAIFlex>
        </>
      ) : null}
      {copyable ? <BAIText copyable={{ text: fullName }} /> : null}
    </BAIFlex>
  );
};

export default ImageNodeSimpleTag;
