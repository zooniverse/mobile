export const filledInFormUrl = (projectName, projectId, phoneType) => {
    const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScq85a1bh9QRgSsKpUOfXB0B-o1y5llJx3AyWhxGyq--LtCrw/viewform?usp=pp_url&'
    const projectNameParam = `entry.1654735524=${projectName.replace(' ', '+')}`
    const projectIdParam = `entry.819810112=${projectId.replace(' ', '+')}`
    const phoneTypeParam = `entry.300202259=${phoneType.replace(' ', '+')}`

    const params = `&${projectNameParam}&${projectIdParam}&${phoneTypeParam}`
    return `${baseUrl}${params}`
}