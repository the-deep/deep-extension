import { createContext } from 'react';

export type ActiveConfig = 'production' | 'staging' | 'custom';

export interface SelectedConfigType {
    activeConfig: ActiveConfig;
    webServerUrl?: string;
    apiServerUrl?: string;
    serverlessUrl?: string;
    identifier?: string;
}

export interface ServerContextInterface {
    selectedConfig: SelectedConfigType;
    setSelectedConfig: React.Dispatch<React.SetStateAction<SelectedConfigType>>;
}

// FIXME: move these somewhere else
export const productionValues: Omit<SelectedConfigType, 'activeConfig'> = {
    webServerUrl: 'https://app.thedeep.io',
    apiServerUrl: 'https://prod-api.thedeep.io',
    serverlessUrl: 'https://services.thedeep.io',
    identifier: 'prod',
};

export const stagingValues: Omit<SelectedConfigType, 'activeConfig'> = {
    webServerUrl: 'https://staging.thedeep.io',
    apiServerUrl: 'https://staging-api.thedeep.io',
    serverlessUrl: 'https://services-alpha.thedeep.io',
    identifier: 'staging',
};

export const defaultServerConfig: SelectedConfigType = {
    activeConfig: 'production',
    ...productionValues,
};

export function getConfig(): Omit<SelectedConfigType, 'activeConfig'> {
    const storageDataText = localStorage.getItem('stored-config');
    const storageData: SelectedConfigType | undefined = storageDataText
        ? JSON.parse(storageDataText)
        : undefined;

    if (!storageData) {
        return defaultServerConfig;
    }
    const currentConfigMode = storageData.activeConfig;

    if (currentConfigMode === 'custom') {
        return storageData;
    }
    if (currentConfigMode === 'production') {
        return productionValues;
    }
    if (currentConfigMode === 'staging') {
        return stagingValues;
    }
    return defaultServerConfig;
}

export const ServerContext = createContext<ServerContextInterface>({
    selectedConfig: defaultServerConfig,
    setSelectedConfig: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setSelectedConfig called on ServerContext without a provider', value);
    },
});

export default ServerContext;
