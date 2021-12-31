// FIXME: remove this
import { productionValues, alphaValues } from '#base/utils/apollo';
import { SelectedConfigType } from '#base/context/serverContext';

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

const urlData: SelectedConfigType | undefined = storageData ? JSON.parse(storageData) : undefined;
const currentConfigMode = urlData?.activeConfig;

function getUrlData() {
    if (currentConfigMode === 'alpha') {
        return alphaValues.apiServer;
    }
    if (currentConfigMode === 'beta') {
        return productionValues.apiServer;
    }
    if (currentConfigMode === 'custom') {
        return urlData?.apiServerUrl;
    }
    return null;
}

const webAddress = getUrlData();

export const wsEndpoint = `${webAddress}/api/v1`;
export const adminEndpoint = `${webAddress}/admin/`;

export const serverlessEndpoint = (() => {
    if (currentConfigMode === 'alpha') {
        return alphaValues?.serverless;
    }
    if (currentConfigMode === 'beta') {
        return productionValues?.serverless;
    }
    if (currentConfigMode === 'custom') {
        return urlData?.serverlessUrl;
    }
    return null;
})();
