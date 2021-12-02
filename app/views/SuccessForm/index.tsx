import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { Button } from '@the-deep/deep-ui';
import route from '../../Base/configs/routes';

import styles from './styles.css';

interface SuccessFormInterface {
    className?: string;
}

function SuccessForm(props: SuccessFormInterface) {
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
        <div className={_cs(className, styles.successForm)}>
            <h1 className={styles.heading}>
                <IoCheckmarkCircle />
                Success
            </h1>
            <p className={styles.message}>
                Leads created successfully!
            </p>
            <p>
                <Button
                    name="add leads"
                    onClick={handleNewLeads}
                >
                    Add more leads
                </Button>
            </p>
        </div>
    );
}

export default SuccessForm;
