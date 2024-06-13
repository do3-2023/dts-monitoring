export const serverConfig = {
    API_HOST: typeof process === 'undefined' ? 'localhost' : process.env['API_HOST']
};