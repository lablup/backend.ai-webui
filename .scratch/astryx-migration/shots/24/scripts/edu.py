p = 'react/src/components/EduAppLauncher.tsx'
s = open(p).read()


def rep(old, new):
    global s
    assert old in s, old[:120]
    s = s.replace(old, new, 1)


rep("""import { Alert, Button, Steps, Typography } from 'antd';
import { BAICard, BAIFlex, toGlobalId, useBAILogger } from 'backend.ai-ui';""",
    """import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Step, Stepper } from '@astryxdesign/lab';
import { BAICard, BAIFlex, toGlobalId, useBAILogger } from 'backend.ai-ui';""")

rep("""  let stepStatuses: Array<'wait' | 'process' | 'finish' | 'error'> = [
    'wait',
    'wait',
  ];""",
    """  // PILOT-DECISION: antd `Steps` -> lab `Stepper` + `Step` (MAPPING §2 LAB).
  // antd's per-item lifecycle enum (`wait|process|finish|error`) has NO
  // counterpart: lab derives completed/active/upcoming from the parent's
  // `activeStep`, and its `status` is a SEMANTIC enum (accent/success/
  // warning/error) layered on top. So only the error state survives as an
  // explicit status; `wait`/`process`/`finish` are expressed by `activeStep`,
  // which is what `currentStep` already carries.
  let stepStatuses: Array<'wait' | 'process' | 'finish' | 'error'> = [
    'wait',
    'wait',
  ];""")

rep("""        <Steps
          orientation="vertical"
          current={currentStep}
          items={[
            {
              title: t('eduapi.PreparingSession'),
              status: stepStatuses[0],
            },
            {
              title: t('eduapi.LaunchingAppStep'),
              status: stepStatuses[1],
            },
          ]}
        />""",
    """        <Stepper
          orientation="vertical"
          activeStep={currentStep}
          label={t('eduapi.AppLaunch')}
        >
          <Step
            step={0}
            label={t('eduapi.PreparingSession')}
            status={stepStatuses[0] === 'error' ? 'error' : undefined}
          />
          <Step
            step={1}
            label={t('eduapi.LaunchingAppStep')}
            status={stepStatuses[1] === 'error' ? 'error' : undefined}
          />
        </Stepper>""")

rep("""          <Alert
            style={{ marginTop: 16 }}
            type="error"
            showIcon
            title={errorTitle}
            description={
              <span style={{ whiteSpace: 'pre-line' }}>{errorDetail}</span>
            }
            action={
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}
              >
                {t('eduapi.RefreshPage')}
              </Button>
            }
          />""",
    """          <Banner
            style={{ marginTop: 16 }}
            status="error"
            title={errorTitle}
            description={
              <span style={{ whiteSpace: 'pre-line' }}>{errorDetail}</span>
            }
            endContent={
              <Button
                size="sm"
                variant="destructive"
                onClick={() => window.location.reload()}
                label={t('eduapi.RefreshPage')}
              />
            }
          />""")

rep("""          <Alert
            style={{ marginTop: 16 }}
            type="success"
            showIcon
            title={t('eduapi.LaunchCompleted')}""",
    """          <Banner
            style={{ marginTop: 16 }}
            status="success"
            title={t('eduapi.LaunchCompleted')}""")

rep("""              <Typography.Link
                href={stage.appConnectUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('eduapi.OpenAppInNewWindow')}
              </Typography.Link>
            }
          />""",
    """              <Link
                href={stage.appConnectUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('eduapi.OpenAppInNewWindow')}
              </Link>
            }
          />""")

open(p, 'w').write(s)
print('ok')
