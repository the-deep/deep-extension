// FIXME: remove this
import { productionValues, alphaValues } from '#base/utils/apollo';

export const reactAppApiHttps = location.protocol === 'https:' // eslint-disable-line no-restricted-globals
    ? 'https'
    : process.env.REACT_APP_API_HTTPS;

/* export const wsEndpoint = !process.env.REACT_APP_API_END
    ? 'http://alpha-2-api.thedeep.io/api/v1'
    : `${reactAppApiHttps}://${process.env.REACT_APP_API_END}/api/v1`;

export const adminEndpoint = !process.env.REACT_APP_ADMIN_END
    ? 'http://alpha-2-api.thedeep.io/admin/'
    : `${reactAppApiHttps}://${process.env.REACT_APP_ADMIN_END}/admin/`;
*/

const storageData = localStorage.getItem('serverConfig');

const UrlData = JSON.parse(storageData);
const currentConfigMode = UrlData?.activeConfig;

function getUrlData() {
    if (currentConfigMode === 'alpha') {
        return alphaValues.webServer;
    }
    if (currentConfigMode === 'beta') {
        return productionValues.webServer;
    }
    if (currentConfigMode === 'custom') {
        return UrlData?.apiServerUrl;
    }
    return null;
}

const webAddress = getUrlData();

export const wsEndpoint = `${webAddress}/api/v1`;
export const adminEndpoint = `${webAddress}/admin/`;

export const serverlessEndpoint = (() => {
    if (process.env.REACT_APP_SERVERLESS_DOMAIN) {
        return process.env.REACT_APP_SERVERLESS_DOMAIN;
    }
    switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
        case 'nightly':
            return 'https://services-nightly.thedeep.io';
        case 'alpha':
            return 'https://services-alpha.thedeep.io';
        case 'beta':
            return 'https://services.thedeep.io';
        default:
            return 'https://services-local.thedeep.io';
    }
})();
