import { newLineToBrElement } from '../helper';
import BAIFlex from './BAIFlex';
import BAISchedulingResultBadge, {
  SchedulingResult,
} from './BAISchedulingResultBadge';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, theme } from 'antd';

/**
 * Minimal sub-step shape the cell needs to surface failure reasons.
 * Structurally satisfied by the Relay-generated sub-step type once the
 * parent fragment selects `step` / `result` / `errorCode` / `message`
 * alongside the `...BAISubStepNodesFragment` spread.
 */
export interface SchedulingSubStepLike {
  readonly step?: string | null;
  readonly result?: string | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}

export interface BAISchedulingResultCellProps {
  result: SchedulingResult | null;
  /**
   * The row's sub-steps. Problematic (non-success) sub-steps that carry a
   * message / errorCode are surfaced through an info icon next to the badge.
   */
  subSteps?: ReadonlyArray<SchedulingSubStepLike> | null;
}

const isNonSuccessResult = (result?: string | null) =>
  result != null && result !== 'SUCCESS' && result !== '%future added value';

/**
 * Renders a scheduling `result` badge. For a non-success row, if any of its
 * sub-steps failed (or need retry) with a message, an info icon is shown
 * whose tooltip lists those sub-step reasons — so the user can see *why* the
 * row is non-success without expanding it. (The row-level message is not
 * repeated here; it already has its own Message column.)
 */
const BAISchedulingResultCell = ({
  result,
  subSteps,
}: BAISchedulingResultCellProps) => {
  'use memo';
  const { token } = theme.useToken();

  const rowIsNonSuccess = isNonSuccessResult(result);

  const problemSteps = (subSteps ?? []).filter(
    (subStep) =>
      isNonSuccessResult(subStep.result) &&
      (!!subStep.message || !!subStep.errorCode),
  );

  const showInfo = rowIsNonSuccess && problemSteps.length > 0;

  return (
    <BAIFlex direction="row" align="center" gap="xxs">
      <BAISchedulingResultBadge result={result} />
      {showInfo ? (
        <Tooltip
          title={
            <BAIFlex direction="column" align="stretch" gap="xs">
              {problemSteps.map((subStep, idx) => (
                <div key={`${subStep.step ?? 'step'}-${idx}`}>
                  {subStep.step ? <strong>{subStep.step}: </strong> : null}
                  {subStep.message
                    ? newLineToBrElement(subStep.message)
                    : subStep.errorCode}
                </div>
              ))}
            </BAIFlex>
          }
        >
          <InfoCircleOutlined
            style={{ color: token.colorTextSecondary, cursor: 'help' }}
          />
        </Tooltip>
      ) : null}
    </BAIFlex>
  );
};

export default BAISchedulingResultCell;
