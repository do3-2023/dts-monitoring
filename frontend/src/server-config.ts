export const serverConfig = {
    API_HOST: typeof process === 'undefined' ? '' : process.env['API_HOST']
};