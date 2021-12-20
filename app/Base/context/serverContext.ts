import { createContext } from 'react';

interface SelectedConfigType {
    activeConfig: 'prod' | 'alpha' | 'custom';
    customWebAddress?: string;
    customApiAddress?: string;
    customServerlessAddress?: string;
}

export interface ServerContextInterface {
    selectedConfig: SelectedConfigType;
    setSelectedConfig: React.Dispatch<React.SetStateAction<SelectedConfigType>>;
}

const defaultServerConfig = {
    activeConfig: 'custom' as const,
    customWebAddress: 'https://alpha-2-api.thedeep.io',
    customApiAddress: 'https://api.alpha.thedeep.io',
    customServerlessAddress: 'https://services-alpha.thedeep.io',
};

export const ServerContext = createContext<ServerContextInterface>({
    selectedConfig: defaultServerConfig,
    setSelectedConfig: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setSelectedConfig called on ServerContext without a provider', value);
    },
});

export default ServerContext;
