import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoIosCloseCircle } from 'react-icons/io';
import { Button } from '@the-deep/deep-ui';
import route from '../../Base/configs/routes';

import styles from './styles.css';

interface FailureFormInterface {
    className?: string;
}

function FailureForm(props: FailureFormInterface) {
    const {
        className,
    } = props;

    const history = useHistory();

    const handleNewLeads = useCallback(
        () => {
            history.push(route.home.path);
        },
        [history],
    );

    return (
        <div className={_cs(className, styles.failureForm)}>
            <h1 className={styles.heading}>
                <IoIosCloseCircle />
                Failure
            </h1>
            <p className={styles.message}>
                Sorry, leads could not be created at the moment !
            </p>
            <p>
                <Button
                    name="add leads"
                    onClick={handleNewLeads}
                >
                    Add leads
                </Button>
            </p>
        </div>
    );
}

export default FailureForm;
