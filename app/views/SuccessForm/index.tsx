import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';

import styles from './styles.css';

interface SuccessFormInterface {
    className?: string;
}

function SuccessForm(props: SuccessFormInterface) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.successForm)}>
            <h1 className={styles.heading}>
                <IoCheckmarkCircle />
                Success
            </h1>
            <p className={styles.message}>
                Leads created successfully!
            </p>
        </div>
    );
}

export default SuccessForm;
