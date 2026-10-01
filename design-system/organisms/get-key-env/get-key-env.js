import { fetchAEMData } from '/core/scripts/utils/aem-data.js';

export const getEnvironmentValues = async (keys = []) => {
  const config = await fetchAEMData('environment');
  const envData = config?.environment?.data || [];

  // Recorremos las llaves solicitadas y extraemos el texto de cada una
  return keys.map((searchKey) => {
    const foundItem = envData.find((item) => item.Key === searchKey);
    return foundItem?.Text ?? '';
  });
};