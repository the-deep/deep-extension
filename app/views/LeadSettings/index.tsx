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
import {
    BasicEntity,
    basicEntityKeySelector,
    basicEntityLabelSelector,
} from '../../utils/common';
import useStoredState from '#base/hooks/useLocalStorage';
import styles from './styles.css';

interface Props {
    className?: string;
}

function LeadSettings(props: Props) {
    const {
        className,
    } = props;

    const serverOptions: BasicEntity[] = [
        {
            id: '1',
            name: 'Alpha',
        },
        {
            id: '2',
            name: 'Beta',
        },
        {
            id: '3',
            name: 'Custom',
        },
    ];

    const betaValues = {
        webServer: 'https://beta.thedeep.io',
        apiServer: 'https://api.thedeep.io',
        serverLess: 'https://services.thedeep.io',
    };

    const alphaValues = {
        webServer: 'https://alpha.thedeep.io',
        apiServer: 'https://api.alpha.thedeep.io',
        serverLess: 'https://services-alpha.thedeep.io',
    };

    const [
        activeView,
        setActiveView,
    ] = useState<string>('1');

    const [
        disableInput,
        setDisableInput,
    ] = useState(true);

    const [
        webServerState,
        setWebServerState,
    ] = useState<string | undefined>(alphaValues.webServer);
    const [
        apiServerState,
        setApiServerState,
    ] = useState<string | undefined>(alphaValues.apiServer);
    const [
        serverlessState,
        setServerlessState,
    ] = useState<string | undefined>(alphaValues.serverLess);

    const webLocal = useStoredState('webServer', webServerState);
    const apiLocal = useStoredState('apiServer', apiServerState);
    const serverlessLocal = useStoredState('serverless', serverlessState);

    const handleSubmit = useCallback(
        // TODO: HANDLE local storage
        () => {
            console.log('Need to handle local storage in submit::>>');
        }, [],
    );

    const handleServerEnvironment = useCallback(
        (val: string) => {
            setActiveView(val);
            if (val === '1') {
                setWebServerState(alphaValues.webServer);
                setApiServerState(alphaValues.apiServer);
                setServerlessState(alphaValues.serverLess);
                setDisableInput(true);
            } else if (val === '2') {
                setWebServerState(betaValues.webServer);
                setApiServerState(betaValues.apiServer);
                setServerlessState(betaValues.serverLess);
                setDisableInput(true);
            } else {
                setWebServerState(undefined);
                setApiServerState(undefined);
                setServerlessState(undefined);
                setDisableInput(false);
            }
        },
        [
            alphaValues.webServer,
            alphaValues.apiServer,
            alphaValues.serverLess,
            betaValues.webServer,
            betaValues.apiServer,
            betaValues.serverLess,
        ],
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
                    disabled={disableInput}
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
                    keySelector={basicEntityKeySelector}
                    labelSelector={basicEntityLabelSelector}
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
