import { ApolloError } from '@apollo/client';

export function isArrayEqual<T>(foo: readonly T[], bar: T[]) {
    return foo.length === bar.length && foo.every((fooItem, index) => fooItem === bar[index]);
}

export function checkErrorCode(errors: ApolloError['graphQLErrors'], path: (string | number)[], code: string) {
    return errors.some((error) => (
        error.path && error.extensions?.code
        && isArrayEqual(error.path, path) && code === error.extensions.code
    ));
}

export const productionValues = {
    webServer: 'https://app.thedeep.io',
    apiServer: 'https://prod-api.thedeep.io',
    serverless: 'https://services.thedeep.io',
    identifier: 'prod',
};

export const alphaValues = {
    webServer: 'https://staging.thedeep.io',
    apiServer: 'https://staging-api.thedeep.io',
    serverless: 'https://services-alpha.thedeep.io',
    identifier: 'staging',
};
