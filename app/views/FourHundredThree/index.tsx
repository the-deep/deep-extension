import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Heading } from '@the-deep/deep-ui';
import styles from './styles.css';

interface FourHundredThreeProps {
    className?: string;
}

function FourHundredThree(props: FourHundredThreeProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.fourHundredThree)}>
            <Heading className={styles.heading}>
                403
            </Heading>
            <p className={styles.message}>
                You do not have access to this page!
            </p>
        </div>
    );
}

export default FourHundredThree;
