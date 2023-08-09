import React from 'react';
import { Button, Card, Row, Col } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from "react-i18next";
import { useWebComponentInfo } from './DefaultProviders';

const MaintenanceView : React.FC = () => {
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
				<Card
					className="matchDatabase"
					title={t("maintenance.Fix")}
					bodyStyle={{ paddingTop: "10px" }}
				>
					<p
						className="title"
						style={{
							fontSize: "14px",
							fontWeight: "bold"
						}}
					>
						{t("maintenance.MatchDatabase")}
					</p>
					<p
						className="description"
						style={{
							fontSize: "13px",
							marginTop: "5px",
							marginRight: "5px"
						}}
					>
						<Trans>
							{t("maintenance.DescMatchDatabase")}
						</Trans>
					</p>
					<Button
						block
						disabled={recalculating}
						icon={<RedoOutlined />}
						style={{
							color: "#38bd73",
							borderWidth: "2px",
							borderColor: "#e0e0e0",
						}}
						onClick={()=> dispatchEvent("recalculate", null)}
					>
						{recalculating ? t("maintenance.Recalculating") : t("maintenance.RecalculateUsage")}
					</Button>
				</Card>
			</Col>
			<Col>
				<Card
					className="ImageEnvironment"
					title={t('maintenance.ImagesEnvironment')}
					bodyStyle={{ paddingTop: "10px" }}
				>
					<p
						className="title"
						style={{
							fontSize: "14px",
							fontWeight: "bold"
						}}
					>
						{t("maintenance.RescanImageList")}
					</p>
					<p
						className="description"
						style={{
							fontSize: "13px",
							marginTop: "5px",
							marginRight: "5px"
						}}
					>
						<Trans>
							{t("maintenance.DescRescanImageList")}
						</Trans>
					</p>
					<Button
						block
						disabled={scanning}
						icon={<RedoOutlined />}
						style={{
							color: "#38bd73",
							borderWidth: "2px",
							borderColor: "#e0e0e0",
						}}
						onClick={()=> dispatchEvent("rescan", null)}
					>
						{scanning ? t("maintenance.RescanImageScanning") : t("maintenance.RescanImages")}
					</Button>
				</Card>
			</Col>
		</Row>
	);
}

export default MaintenanceView;