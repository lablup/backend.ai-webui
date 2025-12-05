import { BAIResourceGroupSelectQuery } from '../../__generated__/BAIResourceGroupSelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIResourceGroupSelectProps
  extends Omit<BAISelectProps, 'options'> {}

const BAIResourceGroupSelect = ({
  ...selectProps
}: BAIResourceGroupSelectProps) => {
  const { t } = useTranslation();
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
