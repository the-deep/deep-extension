import React from 'react';
import {
    Message,
    Kraken,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import route from '#base/configs/routes';

interface SuccessFormInterface {
    className?: string;
}

function SuccessForm(props: SuccessFormInterface) {
    const {
        className,
    } = props;

    return (

        <Message
            className={_cs(className)}
            message={(
                <>
                    <p>
                        Source created successfully!
                        &nbsp;
                        <IoCheckmarkCircle />
                    </p>
                </>
            )}
            icon={(
                <Kraken
                    size="extraLarge"
                    variant="ballon"
                />
            )}
            actions={(
                <SmartButtonLikeLink
                    route={route.home}
                >
                    Go Back
                </SmartButtonLikeLink>
            )}
        />
    );
}

export default SuccessForm;
