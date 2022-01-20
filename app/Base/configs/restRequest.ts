import { getConfig } from '#base/context/ServerContext';

const config = getConfig();

const webAddress = config?.apiServerUrl;

// NOTE: this may not be used anywhere else
export const wsEndpoint = `${webAddress}/api/v1`;

// NOTE: this may not be used anywhere else
export const adminEndpoint = `${webAddress}/admin/`;

// NOTE: this may not be used anywhere else
export const serverlessEndpoint = config?.serverlessUrl;
