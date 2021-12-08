import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Button,
    SegmentInput,
    ContainerCard,
    Card,
    TextInput,
} from '@the-deep/deep-ui';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import route from '../../Base/configs/routes';
import useStoredState from '#base/hooks/useLocalStorage';
import styles from './styles.css';

interface Props {
    className?: string;
}

const productionValues = {
    webServer: 'https://beta.thedeep.io',
    apiServer: 'https://api.thedeep.io',
    serverLess: 'https://services.thedeep.io',
};

const alphaValues = {
    webServer: 'https://alpha.thedeep.io',
    apiServer: 'https://api.alpha.thedeep.io',
    serverLess: 'https://services-alpha.thedeep.io',
};

type ConfigKeys = 'prod' | 'alpha' | 'custom';

const serverOptions: { key: ConfigKeys; name: string }[] = [
    {
        key: 'prod',
        name: 'Production',
    },
    {
        key: 'alpha',
        name: 'Alpha',
    },
    {
        key: 'custom',
        name: 'Custom',
    },
];

interface SelectedConfig {
    activeConfig: 'prod' | 'alpha' | 'custom';
    customWebAddress?: string;
    customApiAddress?: string;
    customServerlessAddress?: string;
}

const defaultServerConfig = {
    activeConfig: 'custom' as const,
    customWebAddress: 'http://localhost:3000',
    customApiAddress: 'http://localhost:8000',
    customServerlessAddress: 'http://local.the-deep.io',
};

function LeadSettings(props: Props) {
    const {
        className,
    } = props;

    const [
        selectedConfig,
        setSelectedConfig,
    ] = useStoredState<SelectedConfig>('serverConfig', defaultServerConfig);

    const [
        activeView,
        setActiveView,
    ] = useState<ConfigKeys>(selectedConfig.activeConfig);

    const [
        disableInput,
        setDisableInput,
    ] = useState(true);

    const [
        webServerState,
        setWebServerState,
    ] = useState<string | undefined>(selectedConfig.customWebAddress);
    const [
        apiServerState,
        setApiServerState,
    ] = useState<string | undefined>(selectedConfig.customApiAddress);
    const [
        serverlessState,
        setServerlessState,
    ] = useState<string | undefined>(selectedConfig.customServerlessAddress);

    const handleSubmit = useCallback(
        () => {
            setSelectedConfig({
                activeConfig: activeView,
                customWebAddress: webServerState,
                customApiAddress: apiServerState,
                customServerlessAddress: serverlessState,
            });
        }, [activeView, webServerState, apiServerState, serverlessState, setSelectedConfig],
    );

    const handleServerEnvironment = useCallback(
        (val: ConfigKeys) => {
            setActiveView(val);
            if (val === 'prod') {
                setWebServerState(productionValues.webServer);
                setApiServerState(productionValues.apiServer);
                setServerlessState(productionValues.serverLess);
                setDisableInput(true);
            } else if (val === 'alpha') {
                setWebServerState(alphaValues.webServer);
                setApiServerState(alphaValues.apiServer);
                setServerlessState(alphaValues.serverLess);
                setDisableInput(true);
            } else {
                setWebServerState(undefined);
                setApiServerState(undefined);
                setServerlessState(undefined);
                setDisableInput(false);
            }
        }, [],
    );

    return (
        <ContainerCard
            className={_cs(className, styles.settingsBox)}
            heading="Settings"
            borderBelowHeader
            headerActions={(
                <Link
                    to={route.index.path}
                >
                    <IoArrowBackCircleSharp />
                </Link>
            )}
            footerActions={(
                <Button
                    // FIXME: Add disabled during pristine later
                    name="save"
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            <>
                <SegmentInput
                    className={styles.input}
                    name="server-env"
                    value={activeView}
                    onChange={handleServerEnvironment}
                    options={serverOptions}
                    keySelector={(d) => d.key}
                    labelSelector={(d) => d.name}
                />
                <Card className={_cs(styles.alphaForm, className)}>
                    <TextInput
                        className={styles.input}
                        label="WEB SERVER ADDRESS"
                        name="webServerAddress"
                        value={webServerState}
                        onChange={setWebServerState}
                        readOnly={disableInput}
                    />
                    <TextInput
                        className={styles.input}
                        label="API SERVER ADDRESS"
                        name="apiServerAddress"
                        value={apiServerState}
                        onChange={setApiServerState}
                        readOnly={disableInput}
                    />
                    <TextInput
                        className={styles.input}
                        label="SERVERLESS SERVER ADDRESS"
                        name="serverLessServerAddress"
                        value={serverlessState}
                        onChange={setServerlessState}
                        readOnly={disableInput}
                    />
                </Card>
            </>
        </ContainerCard>
    );
}

export default LeadSettings;
