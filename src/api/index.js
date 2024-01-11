import erasClient from 'panoptes-client/lib/eras-client';

export const getAllUserClassifications = async (userId, token) => {
  const classifications = {};
  const url = `https://eras.zooniverse.org/classifications/users/${userId}?project_contributions=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    const respJson = await response.json();
    if (Array.isArray(respJson?.project_contributions)) {
      for (const contribution of respJson.project_contributions) {
        classifications[contribution.project_id] = true;
      }
    }
  } catch (e) {
    return {};
  }

  return classifications;
};
