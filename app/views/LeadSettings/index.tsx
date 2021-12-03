import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Card,
    Button,
    Container,
    Heading,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { useHistory } from 'react-router-dom';

import route from '../../Base/configs/routes';
import AlphaMode from './AlphaMode';
import BetaMode from './BetaMode';
import LocalHostMode from './LocalhostMode';
import CustomMode from './CustomMode';

import styles from './styles.css';

interface Props {
    className?: string;
}

function LeadSettings(props: Props) {
    const {
        className,
    } = props;

    const history = useHistory();

    const [activeView, setActiveView] = React.useState<'beta' | 'alpha' | 'localhost' | 'custom' | undefined>('beta');

    const redirectToLead = useCallback(
        () => {
            history.push(route.home.path);
        }, [history],
    );

    const handleSubmit = useCallback(
        () => {
            console.log('Handle Settings submit:::');
        }, [],
    );

    return (
        <Container
            className={_cs(className, styles.settingsBox)}
        >

            <Card
                className={styles.formContainer}
            >
                <>
                    <div className={styles.cardHead}>
                        <Heading
                            className={styles.leftHeader}
                            size="medium"
                        >
                            Settings
                        </Heading>
                        <Heading
                            className={styles.rightHeader}
                            size="large"
                        >
                            <IoArrowBackCircleSharp onClick={redirectToLead} />
                        </Heading>
                    </div>

                    <Tabs
                        value={activeView}
                        onChange={setActiveView}
                    >
                        <Container
                            className={_cs(styles.settingsContainer)}
                            spacing="none"
                            headingSize="extraSmall"
                            heading={(
                                <TabList>
                                    <Tab
                                        name="beta"
                                        transparentBorder
                                    >
                                        Beta
                                    </Tab>
                                    <Tab
                                        name="alpha"
                                        transparentBorder
                                    >
                                        Alpha
                                    </Tab>
                                    <Tab
                                        name="localhost"
                                        transparentBorder
                                    >
                                        LocalHost
                                    </Tab>
                                    <Tab
                                        name="custom"
                                        transparentBorder
                                    >
                                        Custom
                                    </Tab>
                                </TabList>
                            )}
                            borderBelowHeader
                        >
                            <TabPanel name="beta">
                                <BetaMode />
                            </TabPanel>
                            <TabPanel name="alpha">
                                <AlphaMode />
                            </TabPanel>
                            <TabPanel name="localhost">
                                <LocalHostMode />
                            </TabPanel>
                            <TabPanel name="custom">
                                <CustomMode />
                            </TabPanel>
                        </Container>
                    </Tabs>

                    <Button
                        className={styles.saveSettingsButton}
                        name="save"
                        // FIXME: Add disabled during pristine later
                        // disabled={pending}
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                </>
            </Card>
        </Container>
    );
}

export default LeadSettings;
