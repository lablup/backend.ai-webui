/**
 * antd 6.5.0 oracle for the qa8 SESSION group.
 * Run with:  node --experimental-default-type=module \
 *   --input-type=module  (see below — it is executed from the oracle sandbox)
 *
 *   cd /home/ubuntu/.claude/jobs/6e087a7f/tmp/antd-oracle
 *   node <this file>
 */
import { theme } from 'antd';

const seedLight = {
  colorPrimary: '#FF7A00',
  colorLink: '#FF7A00',
  colorText: '#141414',
  colorInfo: '#028DF2',
  colorError: '#FF4D4F',
  colorSuccess: '#00BD9B',
};
const L = theme.getDesignToken({ token: seedLight });

const keys = [
  'controlHeightSM',
  'controlHeight',
  'controlHeightLG',
  'fontSize',
  'fontSizeSM',
  'fontSizeLG',
  'fontSizeIcon',
  'padding',
  'paddingSM',
  'paddingMD',
  'paddingLG',
  'paddingXL',
  'paddingXS',
  'paddingXXS',
  'marginXS',
  'borderRadius',
  'borderRadiusLG',
  'lineHeight',
  'lineHeightSM',
  'lineWidth',
];
for (const k of keys) console.log(k.padEnd(20), L[k]);
