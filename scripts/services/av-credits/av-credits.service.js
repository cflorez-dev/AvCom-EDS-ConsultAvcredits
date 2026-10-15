import { getEnvironmentValues } from '/design-system/organisms/get-key-env/get-key-env.js';
import { httpClient } from '../../http-client.js';

const CHANNEL = 'AVCOM';
const [endPoint, suffixBalance, suffixTxn] = await getEnvironmentValues([
  'AVC_ENVIRONMENT_API_URL',
  'SUFFIX_BALANCEENQUIRY',
  'SUFFIX_TXNHISTORY'
]);

export const validateBalance = async (encryptedVoucher, encryptedPin) => {

  const fetchUrl = `${endPoint}/${suffixBalance}`;
  const requestData = {
    "balance-enquiry": {
      "channel": CHANNEL,
      "voucher": encryptedVoucher,
      "pin": encryptedPin
    }
  }
  
  return httpClient(fetchUrl, {
    method: 'POST',
    body: requestData
  });
};

export const txnHistory = async (encryptedVoucher) => {
  
  const fetchUrl = `${endPoint}/${suffixTxn}`;
  const requestData = {
    "txn-history": {
      "channel": CHANNEL,
      "voucher": encryptedVoucher,
      "pin": ""
    }
  }
  
  return httpClient(fetchUrl, {
    method: 'POST',
    body: requestData
  });
};