import { Carousel, Image, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useTranslation, Trans } from 'react-i18next';

const { useToken } = theme;

const TerminalGuideCarousel = () => {
  const { t } = useTranslation();
  const { token } = useToken();
  // @ts-ignore
  const lang = globalThis.backendaioptions.get(
    'language',
    'default',
    'general',
  );
  const docLang = ['en', 'ko', 'ja'].includes(lang) ? lang : 'en';

  const keyBoxStyle = (token: any) => ({
    fontSize: token.fontSizeHeading3,
    fontWeight: token.fontWeightStrong,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 4,
    padding: '0 8px',
    background: token.colorBgContainer,
  });

  return (
    <BAIFlex style={{ overflow: 'hidden' }} align="center" justify="center">
      <div style={{ width: '100%', maxWidth: 560 }}>
        <Carousel
          arrows
          dots={false}
          infinite={false}
          adaptiveHeight
          style={{
            width: '100%',
          }}
        >
          <BAIFlex
            direction="column"
            align="center"
            justify="center"
            style={{
              width: '100%',
              position: 'relative',
            }}
          >
            <BAIFlex
              style={{ position: 'relative', minHeight: 200, maxHeight: 400 }}
            >
              <Image
                src={'/resources/images/web-terminal-guide-1.png'}
                alt="Terminal guide 1"
                preview={false}
              />

              <BAIFlex
                direction="row"
                align="center"
                justify="center"
                gap={'sm'}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: 'auto',
                  width: 'fit-content',
                  height: 'fit-content',
                  zIndex: 2,
                }}
              >
                <Typography.Text style={keyBoxStyle(token)}>
                  Ctrl
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: token.fontSizeHeading3,
                    fontWeight: token.fontWeightStrong,
                    color: '#ffffff',
                  }}
                >
                  +
                </Typography.Text>
                <Typography.Text style={keyBoxStyle(token)}>B</Typography.Text>
              </BAIFlex>
            </BAIFlex>
            <Typography.Paragraph
              style={{ textAlign: 'center', marginTop: 10, width: '100%' }}
            >
              <Trans i18nKey={'webTerminalUsageGuide.CopyGuideOne'} />
            </Typography.Paragraph>
          </BAIFlex>

          <BAIFlex
            direction="column"
            align="center"
            justify="center"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <BAIFlex
              style={{ position: 'relative', minHeight: 200, maxHeight: 400 }}
            >
              <Image
                src={'/resources/images/web-terminal-guide-2.png'}
                alt="Terminal guide 2"
                preview={false}
              />
            </BAIFlex>
            <Typography.Paragraph
              style={{ textAlign: 'center', marginTop: 10, width: '100%' }}
            >
              <Trans i18nKey={'webTerminalUsageGuide.CopyGuideTwo'} />
            </Typography.Paragraph>
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="center"
            justify="center"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <BAIFlex
              style={{ position: 'relative', minHeight: 200, maxHeight: 400 }}
            >
              <Image
                src={'/resources/images/web-terminal-guide-3.png'}
                alt="Terminal guide 3"
                preview={false}
              />
            </BAIFlex>
            <Typography.Paragraph
              style={{ textAlign: 'center', marginTop: 10, width: '100%' }}
            >
              <Trans i18nKey={'webTerminalUsageGuide.CopyGuideThree'} />
            </Typography.Paragraph>
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="center"
            justify="center"
            style={{ width: '100%', position: 'relative', height: 400 }}
          >
            <BAIFlex
              style={{ position: 'relative', minHeight: 200, maxHeight: 400 }}
            >
              <Image
                src={'/resources/images/web-terminal-guide-4.png'}
                alt="Terminal guide 4"
                preview={false}
              />

              <BAIFlex
                direction="row"
                align="center"
                justify="center"
                gap={'sm'}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: 'auto',
                  width: 'fit-content',
                  height: 'fit-content',
                  zIndex: 2,
                }}
              >
                <Typography.Text style={keyBoxStyle(token)}>
                  Ctrl
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: token.fontSizeHeading3,
                    fontWeight: token.fontWeightStrong,
                  }}
                >
                  +
                </Typography.Text>
                <Typography.Text style={keyBoxStyle(token)}>B</Typography.Text>
              </BAIFlex>
            </BAIFlex>
            <Typography.Paragraph
              style={{ textAlign: 'center', marginTop: 10, width: '100%' }}
            >
              <Trans i18nKey={'webTerminalUsageGuide.CopyGuideFour'} />
            </Typography.Paragraph>
            <BAIFlex style={{ justifyContent: 'end' }}>
              <Typography.Link
                href={`https://webui.docs.backend.ai/${docLang}/latest/sessions_all/sessions_all.html#advanced-web-terminal-usage`}
                style={{ textAlign: 'right' }}
              >
                {t('webTerminalUsageGuide.LearnMore')}
              </Typography.Link>
            </BAIFlex>
          </BAIFlex>
        </Carousel>
      </div>
    </BAIFlex>
  );
};

export default TerminalGuideCarousel;
