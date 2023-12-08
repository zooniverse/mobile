import apiClient from 'panoptes-client/lib/api-client';

export const getAllUserClassifications = async (userId) => {
  let classifications = [];
  let page = 1;

  while (page) {
    try {
      const getClassifications = await apiClient
        .type('classifications')
        .get({ user_id: userId, page });

      if (Array.isArray(getClassifications)) {
        classifications = [...classifications, ...getClassifications];
        page = getClassifications.length === 20 ? ++page : false;
        continue;
      }

      break;
    } catch (err) {
      throw new Error('Error getting all user classifications', err.message);
    }
  }

  return classifications;
};
