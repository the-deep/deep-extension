import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoSettingsOutline } from 'react-icons/io5';

import Svg from '#base/components/Svg';
import deepLogo from '#base/resources/deep-logo-new.svg';
import SmartLink from '#base/components/SmartLink';
// import SmartNavLink from '#base/components/SmartNavLink';
import route from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.appBrand}>
                <Svg
                    src={deepLogo}
                    className={styles.logo}
                />
            </div>
            <div className={styles.main}>
                {/*
                <SmartNavLink
                    exact
                    route={route.home}
                    className={styles.link}
                />
                */}
                <SmartLink
                    route={route.leadSettings}
                    className={styles.link}
                >
                    <IoSettingsOutline />
                </SmartLink>
            </div>
        </nav>
    );
}

export default Navbar;
