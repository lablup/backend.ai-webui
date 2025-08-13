import { Carousel, Image, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

const TerminalGuideCarousel = () => {
  const { t } = useTranslation();
  return (
    <>
      <style>
        {`
          .ant-carousel .slick-prev,
          .ant-carousel .slick-next,
          .ant-carousel .slick-prev:hover,
          .ant-carousel .slick-next:hover {
            color: black;
          }

          .ant-carousel.slick-arrow.slick-disabled {
            color: gray !important;
        }
            .keyboard {
            font-family: Menlo, Courier, 'Courier New';
            padding: 8px 16px;
            background-color: #eee;
            border-radius: 8px;
            margin: 0 4px;
            color: #333;
            font-size: 12px; 
            display: inline-block;
          }
          .keyboard.invert {
            background: none;
            color: #eee;
            font-size: 20px;
          }
        `}
      </style>

      <Carousel
        dots
        arrows
        infinite={false}
        style={{
          border: '1px solid red',
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <BAIFlex>
          <BAIFlex
            direction="column"
            align="center"
            justify="center"
            style={{ width: '100%' }}
            gap={16}
          >
            <Image
              src={'/resources/images/web-terminal-guide-1.png'}
              alt="Terminal Guide 1"
              style={{ width: 400 }}
              preview={false}
            />
            <BAIFlex
              align="center"
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
                pointerEvents: 'none',
              }}
            >
              <span className="keyboard">Ctrl</span>
              <span className="keyboard invert">+</span>
              <span className="keyboard">B</span>
            </BAIFlex>
          </BAIFlex>
          <Typography.Paragraph style={{ textAlign: 'center' }}>
            {t('webTerminalUsageGuide.CopyGuideOne')}
          </Typography.Paragraph>
        </BAIFlex>
        <BAIFlex
          direction="column"
          style={{ width: '100%', position: 'relative', margin: '10 auto' }}
          gap={16}
        >
          <BAIFlex
            style={{
              position: 'relative',
              width: 400,
              height: 180,
              margin: '0 auto',
            }}
          >
            <Image
              src={'/resources/images/web-terminal-guide-2.png'}
              alt="Terminal Guide 2"
              style={{ width: 400 }}
              preview={false}
            />
          </BAIFlex>
          <Typography.Paragraph style={{ padding: '10px 0' }}>
            {t('webTerminalUsageGuide.CopyGuideTwo')}
          </Typography.Paragraph>
        </BAIFlex>
      </Carousel>
    </>
  );
};

export default TerminalGuideCarousel;
