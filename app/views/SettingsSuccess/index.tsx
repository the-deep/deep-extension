import React, { useCallback } from 'react';
import { Button } from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle, IoRemoveCircle } from 'react-icons/io5';

import styles from './styles.css';

interface SettingsFormInterface {
    className?: string;
}

function SettingsSuccess(props: SettingsFormInterface) {
    const {
        className,
    } = props;

    const handleCloseExtension = useCallback(() => {
        window.close();
    }, []);

    return (
        <div className={_cs(className, styles.successPage)}>
            <div className={styles.successHeading}>
                <p className={styles.contentArea}>
                    Please re-open the extension
                </p>
                <p className={styles.contentArea}>
                    to apply url settings!&nbsp;
                    <IoCheckmarkCircle />
                </p>
            </div>
            <div className={styles.closeButton}>
                <Button
                    variant="general"
                    name={undefined}
                    onClick={handleCloseExtension}
                >
                    <IoRemoveCircle />
                    &nbsp; Close
                </Button>
            </div>
        </div>
    );
}

export default SettingsSuccess;
