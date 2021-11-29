import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoIosCloseCircle } from 'react-icons/io';

import styles from './styles.css';

interface FailureFormInterface {
    className?: string;
}

function FailureForm(props: FailureFormInterface) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.failureForm)}>
            <h1 className={styles.heading}>
                <IoIosCloseCircle />
                Failure
            </h1>
            <p className={styles.message}>
                Sorry, leads could not be created at the moment !
            </p>
        </div>
    );
}

export default FailureForm;
