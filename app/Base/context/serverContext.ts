import { createContext } from 'react';

export interface SelectedConfigType {
    activeConfig: 'beta' | 'alpha' | 'custom';
    webServerUrl?: string;
    apiServerUrl?: string;
    serverlessUrl?: string;
    identifier?: string;
}

export interface ServerContextInterface {
    selectedConfig: SelectedConfigType;
    setSelectedConfig: React.Dispatch<React.SetStateAction<SelectedConfigType>>;
}

export const defaultServerConfig = {
    activeConfig: 'custom' as const,
    webServerUrl: 'https://alpha-2.thedeep.io',
    apiServerUrl: 'https://alpha-2-api.thedeep.io',
    serverlessUrl: 'https://services-local.thedeep.io',
    identifier: 'alpha-2',
};

export const ServerContext = createContext<ServerContextInterface>({
    selectedConfig: defaultServerConfig,
    setSelectedConfig: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setSelectedConfig called on ServerContext without a provider', value);
    },
});

export default ServerContext;
