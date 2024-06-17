export const serverConfig = {
    API_URL: typeof process === 'undefined' ? '' : process.env['API_URL']
};