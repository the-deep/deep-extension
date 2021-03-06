import React, { useCallback } from 'react';
import {
    Message,
    Kraken,
    Button,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';

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
        <Message
            className={_cs(className)}
            message={(
                <>
                    <p> Please re-open the extension</p>
                    <p>
                        to apply url settings!
                        &nbsp;
                        <IoCheckmarkCircle />
                    </p>
                </>
            )}
            icon={(
                <Kraken
                    size="extraLarge"
                    variant="skydive"
                />
            )}
            actions={(
                <Button
                    name="closeExtension"
                    onClick={handleCloseExtension}
                    variant="primary"
                >
                    Go back
                </Button>
            )}
        />
    );
}

export default SettingsSuccess;
