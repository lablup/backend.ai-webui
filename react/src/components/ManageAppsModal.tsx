import React from "react";
import {
    Modal,
    ModalProps,
    Input,
    Typography,
    Space,
    Button,
} from "antd";
import { 
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons"
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from "./DefaultProviders";


interface Props extends ModalProps {}
const { Text } = Typography;
const ManageAppsModal: React.FC<Props> = ({...modalProps}) => {
    const { t } = useTranslation();
    const { value, dispatchEvent } = useWebComponentInfo();
    let parsedValue: {
        open: boolean;
        servicePorts: any;
    };
    try {
        parsedValue = JSON.parse(value || "");
    }catch (error) {
        parsedValue = {
            open: false,
            servicePorts: [],
        };
    }
    const { open, servicePorts } = parsedValue;

    return (
        <Modal
            open={open}
            onCancel={() => {
                dispatchEvent("cancel", null);
            }}
            centered
            title={t('environment.ManageApps')}
            cancelButtonProps={{style:{display: 'none'}}}
            {...modalProps}
        >
            <Space direction="vertical">
                <Space.Compact block>
                    <Text style={{ width: '30%' }}>{t('environment.AppName')}</Text>
                    <Text style={{ width: '30%' }}>{t('environment.Protocol')}</Text>
                    <Text style={{ width: '30%' }}>{t('environment.Port')}</Text>
                    <Text style={{ width: '10%' }}>{t('environment.Action')}</Text>
                </Space.Compact>
                {servicePorts?.map((item: any, index: number) => {
                    return (
                        <Space.Compact block key={index}>
                            <Input style={{ width: '30%' }} defaultValue={item.app}/>
                            <Input style={{ width: '30%' }} defaultValue={item.protocol}/>
                            <Input style={{ width: '30%' }} defaultValue={item.port}/>
                            <Button style={{ width: '10%' }} icon={<DeleteOutlined />}/>
                        </Space.Compact>
                    )
                })}
                <Button block icon={<PlusOutlined />}>{t('general.Add')}</Button>
            </Space>
        </Modal>
    )
}

export default ManageAppsModal;