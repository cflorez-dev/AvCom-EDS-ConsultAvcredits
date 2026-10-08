import { getEnvironmentValues } from '/design-system/organisms/get-key-env/get-key-env.js';
import { httpClient } from '../../http-client.js';

const CHANNEL = 'AVCOM';
const [endPoint] = await getEnvironmentValues([
  'AVC_ENVIRONMENT_API_URL',
]);

export const validateBalance = async (encryptedVoucher, encryptedPin) => {

  const fetchUrl = `${endPoint}/balanceEnquiry`;
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
  
  const fetchUrl = `https://api-payments-qa.avtest.ink/api_qwikcilver_in/txnhistory`;
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