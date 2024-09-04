import Flex from './Flex';
import {
  Button,
  ButtonProps,
  Card,
  CardProps,
  ConfigProvider,
  theme,
  Typography,
} from 'antd';

export interface BAIStartSimpleCardProps extends CardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  footerButtonProps: ButtonProps;
  description?: string;
  secondary?: Boolean;
}

const BAIStartSimpleCard: React.FC<BAIStartSimpleCardProps> = ({
  icon,
  title,
  footerButtonProps,
  description,
  secondary,
  ...cardProps
}) => {
  const { token } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultBorderColor: 'none',
            defaultColor: secondary ? '#E8FAF6' : '#FFF6E8',
            defaultBg: secondary ? '#00BD9B' : token.colorPrimary,
            defaultHoverColor: secondary ? '#00BD9B' : token.colorPrimary,
            defaultHoverBorderColor: secondary ? '#00BD9B' : token.colorPrimary,
          },
        },
      }}
    >
      <Card
        styles={{
          body: {
            width: 194,
            height: 192,
          },
        }}
        {...cardProps}
      >
        <Flex
          direction="column"
          justify="center"
          align="stretch"
          style={{ height: '100%' }}
        >
          <Flex align="center" direction="column" gap={16}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: 50,
                height: 50,
                padding: 0,
                border: 0,
                color: secondary ? '#00BD9B' : '#FF7A00',
                background: secondary ? '#E8FAF6' : '#FFF6E8',
                fontSize: token.sizeLG,
                borderRadius: '50%',
              }}
            >
              {icon}
            </Flex>
            <Typography.Text
              strong
              style={{
                fontSize: token.fontSizeSM,
                color: '#333333',
                textAlign: 'center',
              }}
            >
              {title}
            </Typography.Text>
            {description && (
              <Typography.Paragraph
                style={{
                  color: token.colorTextDescription,
                  fontSize: token.fontSize - 4,
                  textAlign: 'center',
                }}
              >
                {description}
              </Typography.Paragraph>
            )}
            <Button
              {...footerButtonProps}
              block
              style={{
                borderRadius: token.borderRadiusLG,
              }}
            />
          </Flex>
        </Flex>
      </Card>
    </ConfigProvider>
  );
};

export default BAIStartSimpleCard;
