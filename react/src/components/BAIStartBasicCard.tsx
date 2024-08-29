import Flex from './Flex';
import {
  Button,
  ButtonProps,
  Card,
  CardProps,
  ConfigProvider,
  Divider,
  theme,
  Typography,
} from 'antd';

export interface BAIStartBasicCardProps extends CardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  footerButtonProps: ButtonProps;
  description?: string;
  secondary?: Boolean;
}

const BAIStartBasicCard: React.FC<BAIStartBasicCardProps> = ({
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
        {...cardProps}
        styles={{
          body: {
            paddingTop: token.paddingSM,
            paddingBottom: token.paddingSM,
            paddingLeft: token.paddingMD,
            paddingRight: token.paddingMD,
            width: 210,
            height: 308,
          },
        }}
      >
        <Flex
          direction="column"
          justify="between"
          align="stretch"
          style={{ height: '100%' }}
        >
          <Flex
            align="center"
            direction="column"
            gap={16}
            style={{
              minHeight: 202,
            }}
          >
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
                fontSize: token.fontSizeLG,
                color: secondary ? '#00BD9B' : token.colorLink,
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
          </Flex>
          <Flex direction="column">
            <Divider style={{ margin: 0, marginBottom: token.margin }} />
            <Button
              {...footerButtonProps}
              size="large"
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

export default BAIStartBasicCard;
