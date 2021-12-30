import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import { IoSettingsOutline } from 'react-icons/io5';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import route from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Login(props: Props) {
    const {
        className,
    } = props;

    return (
        <Message
            className={_cs(styles.login, className)}
            message={(
                <>
                    <p>Oh no! Failed to connect with DEEP.</p>
                    <p>Make sure you are logged in or have the correct settings.</p>
                </>
            )}
            icon={(
                <Kraken
                    size="extraLarge"
                    variant="skydive"
                />
            )}
            actions={(
                <SmartButtonLikeLink
                    route={route.leadSettings}
                    icons={(
                        <IoSettingsOutline />
                    )}
                >
                    Settings
                </SmartButtonLikeLink>
            )}
        />
    );
}

export default Login;
