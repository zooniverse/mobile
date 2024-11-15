export const getErasStats = async (userId, start, end, period, token) => {
  const domain =
    process.env.NODE_ENV === 'production'
      ? 'https://eras.zooniverse.org/'
      : 'https://eras-staging.zooniverse.org/';
  const url = `${domain}classifications/users/${userId}?end_date=${end}&period=${period}&start_date=${start}&project_contributions=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    const respJson = await response.json();
    return respJson;
  } catch (e) {
    return {};
  }
};
