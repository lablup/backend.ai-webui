import React from 'react';
import { Button, Card, Row, Col, Typography } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from "react-i18next";
import { useWebComponentInfo } from '../components/DefaultProviders';

const MaintenancePage : React.FC = () => {
	const { t } = useTranslation();

	const { value, dispatchEvent } = useWebComponentInfo();
	let parsedValue: {
		recalculating: boolean;
		scanning: boolean;
	};
	try {
		parsedValue = JSON.parse(value || "");
	} catch (error) {
		parsedValue = {
			recalculating: false,
			scanning: false
		};
	};
	const { recalculating, scanning } = parsedValue

	return(
		<Row gutter={14}>
			<Col>
				<Card title={t("maintenance.Fix")}>
					<Typography.Title
						level={5}
						style={{
							margin: 0,
							paddingBottom: "12px"
						}}
					>
						{t("maintenance.MatchDatabase")}
					</Typography.Title>
					<Trans>
						{t("maintenance.DescMatchDatabase")}
					</Trans>
					<Button
						block
						disabled={recalculating}
						icon={<RedoOutlined />}
						onClick={()=> dispatchEvent("recalculate", null)}
					>
						{recalculating ? t("maintenance.Recalculating") : t("maintenance.RecalculateUsage")}
					</Button>
				</Card>
			</Col>
			<Col>
				<Card title={t('maintenance.ImagesEnvironment')}>
					<Typography.Title
						level={5}
						style={{
							margin: 0, 
							paddingBottom: "12px"
						}}
					>
						{t("maintenance.RescanImageList")}
					</Typography.Title>
					<Trans>
						{t("maintenance.DescRescanImageList")}
					</Trans>
					<Button
						block
						disabled={scanning}
						icon={<RedoOutlined />}
						onClick={()=> dispatchEvent("rescan", null)}
					>
						{scanning ? t("maintenance.RescanImageScanning") : t("maintenance.RescanImages")}
					</Button>
				</Card>
			</Col>
		</Row>
	);
}

export default MaintenancePage;