import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Card,
    TextInput,
} from '@the-deep/deep-ui';
import styles from './styles.css';

interface Props {
    className?: string;
}

function CustomMode(props: Props) {
    const {
        className,
    } = props;
    const serverValues = {
        webServer: 'https://beta.thedeep.io',
        apiServer: 'https://api.thedeep.io',
        serverLess: 'https://services.thedeep.io',
    };

    const [
        webServerState,
        setWebServerState,
    ] = useState<string | undefined>(serverValues.webServer);
    const [
        apiServerState,
        apiWebServerState,
    ] = useState<string | undefined>(serverValues.apiServer);
    const [
        serverLessState,
        setServerLessState,
    ] = useState<string | undefined>(serverValues.serverLess);

    return (
        <Card className={_cs(styles.alphaForm, className)}>
            <TextInput
                className={styles.input}
                label="WEB SERVER ADDRESS"
                name="webServerAddress"
                value={webServerState}
                onChange={setWebServerState}
            />
            <TextInput
                className={styles.input}
                label="API SERVER ADDRESS"
                name="apiServerAddress"
                value={apiServerState}
                onChange={apiWebServerState}
            />
            <TextInput
                className={styles.input}
                label="SERVERLESS SERVER ADDRESS"
                name="serverLessServerAddress"
                value={serverLessState}
                onChange={setServerLessState}
            />
        </Card>
    );
}

export default CustomMode;
