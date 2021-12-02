import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Card,
    TextInput,
} from '@the-deep/deep-ui';
import styles from './styles.css';

interface Props {
    className?: string;
}

function AlphaMode(props: Props) {
    const {
        className,
    } = props;

    const serverValues = {
        webServer: 'https://alpha.thedeep.io',
        apiServer: 'https://api.alpha.thedeep.io',
        serverLess: 'https://services-alpha.thedeep.io',
    };

    return (
        <Card className={_cs(styles.alphaForm, className)}>
            <TextInput
                className={styles.input}
                label="WEB SERVER ADDRESS"
                name="webServerAddress"
                value={serverValues.webServer}
                readOnly
            />
            <TextInput
                className={styles.input}
                label="API SERVER ADDRESS"
                name="apiServerAddress"
                value={serverValues.apiServer}
                readOnly
            />
            <TextInput
                className={styles.input}
                label="SERVERLESS SERVER ADDRESS"
                name="serverLessServerAddress"
                value={serverValues.serverLess}
                readOnly
            />
        </Card>
    );
}

export default AlphaMode;
