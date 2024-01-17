export const getAllUserClassifications = async (userId, token) => {
  const classifications = {};
  const domain = process.env.NODE_ENV === 'production' ? 'https://eras.zooniverse.org/' : 'https://eras-staging.zooniverse.org/';
  const url = `${domain}classifications/users/${userId}?project_contributions=true`;

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
