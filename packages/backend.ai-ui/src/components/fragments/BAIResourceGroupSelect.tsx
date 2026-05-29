import { BAIResourceGroupSelectQuery } from '../../__generated__/BAIResourceGroupSelectQuery.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISelect, { BAISelectProps } from '../BAISelect';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIResourceGroupSelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIResourceGroupSelect = ({
  ...selectProps
}: BAIResourceGroupSelectProps) => {
  const { t } = useBAIi18n();
  // TODO: change it to use ScalingGroupNode
  const { scaling_groups } = useLazyLoadQuery<BAIResourceGroupSelectQuery>(
    graphql`
      query BAIResourceGroupSelectQuery {
        scaling_groups {
          name
        }
      }
    `,
    {},
    {},
  );

  return (
    <BAISelect
      options={_.map(_.uniqBy(scaling_groups, 'name'), (sg) => {
        return {
          label: sg?.name,
          value: sg?.name,
          resourceGroup: sg?.name,
        };
      })}
      showSearch
      placeholder={t('comp:BAIResourceGroupSelect.SelectResourceGroup')}
      {...selectProps}
    />
  );
};

export default BAIResourceGroupSelect;
