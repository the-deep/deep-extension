import React, { useMemo, useState, useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ObjectSchema,
    useForm,
    createSubmitHandler,
    urlCondition,
    requiredStringCondition,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Button,
    SegmentInput,
    ContainerCard,
    Card,
    TextInput,
} from '@the-deep/deep-ui';
import { useHistory } from 'react-router-dom';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

import route from '#base/configs/routes';
import {
    ServerContext,
} from '#base/context/serverContext';
import { productionValues, alphaValues } from '#base/utils/apollo';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import NonFieldError from '#components/NonFieldError';

import styles from './styles.css';

type ConfigKeys = 'beta' | 'alpha' | 'custom';

type ServerConfigFields = {
    webServer: string;
    apiServer: string;
    serverless: string;
    identifier: string;
}
type FormType = PartialForm<ServerConfigFields>;
type FormSchema = ObjectSchema<FormType>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (value?.identifier !== 'alpha' && value?.identifier !== 'beta') {
            return ({
                identifier: [requiredStringCondition],
                webServer: [requiredStringCondition, urlCondition],
                apiServer: [requiredStringCondition, urlCondition],
                serverless: [requiredStringCondition, urlCondition],
            });
        }
        return {
            identifier: [],
            webServer: [],
            apiServer: [],
            serverless: [],
        };
    },
};

const segmentKeySelector = (data: { key: ConfigKeys; }) => data.key;
const segmentLabelSelector = (data: { name: string; }) => data.name;

const serverOptions: { key: ConfigKeys; name: string }[] = [
    {
        key: 'beta',
        name: 'Production',
    },
    {
        key: 'alpha',
        name: 'Alpha',
    },
    {
        key: 'custom',
        name: 'Custom',
    },
];

interface Props {
    className?: string;
}

function SourceSettings(props: Props) {
    const {
        className,
    } = props;

    const history = useHistory();

    const { selectedConfig, setSelectedConfig } = useContext(ServerContext);

    const {
        activeConfig,
        ...otherConfig
    } = selectedConfig;

    const defaultForm: FormType = useMemo(() => ({
        webServer: otherConfig.webServerUrl,
        apiServer: otherConfig.apiServerUrl,
        serverless: otherConfig.serverlessUrl,
        identifier: otherConfig.identifier,
    }), [otherConfig]);

    const {
        pristine,
        value,
        error: settingsError,
        setFieldValue,
        validate,
        setError,
        setPristine,
    } = useForm(schema, defaultForm);

    const error = getErrorObject(settingsError);

    const [
        activeView,
        setActiveView,
    ] = useState<ConfigKeys>(activeConfig);

    const disableInput = activeView !== 'custom';

    const handleCustomSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    const data = { ...val } as FormType;
                    setSelectedConfig({
                        activeConfig: activeView,
                        webServerUrl: data.webServer,
                        apiServerUrl: data.apiServer,
                        serverlessUrl: data.serverless,
                        identifier: data.identifier,
                    });
                },
            );
            submit();
            history.push(route.settingsSuccessForm.path);
        },
        [
            activeView,
            setSelectedConfig,
            history,
            setError,
            validate,
        ],
    );

    const handleFixedSubmit = useCallback(() => {
        setSelectedConfig({
            activeConfig: activeView,
            webServerUrl: otherConfig.webServerUrl,
            apiServerUrl: otherConfig.apiServerUrl,
            serverlessUrl: otherConfig.serverlessUrl,
            identifier: otherConfig.identifier,
        });
        history.push(route.settingsSuccessForm.path);
    }, [
        activeView,
        otherConfig,
        setSelectedConfig,
        history,
    ]);

    const valueToShow = useMemo(
        () => {
            if (activeView === 'beta') {
                return {
                    identifier: productionValues.identifier,
                    webServer: productionValues.webServer,
                    apiServer: productionValues.apiServer,
                    serverless: productionValues.serverless,
                };
            }
            if (activeView === 'alpha') {
                return {
                    identifier: alphaValues.identifier,
                    webServer: alphaValues.webServer,
                    apiServer: alphaValues.apiServer,
                    serverless: alphaValues.serverless,
                };
            }
            return value;
        },
        [
            value,
            activeView,
        ],
    );

    const handleServerEnvironmentChange = useCallback(
        (val: ConfigKeys) => {
            setActiveView(val);
            setPristine(false);
        },
        [setPristine],
    );

    return (
        <ContainerCard
            className={_cs(className, styles.settingsBox)}
            footerActions={(
                <>
                    <SmartButtonLikeLink
                        route={route.home}
                        icons={(
                            <IoArrowBackCircleSharp />
                        )}
                    >
                        Back
                    </SmartButtonLikeLink>
                    <Button
                        name={undefined}
                        onClick={activeView === 'custom' ? handleCustomSubmit : handleFixedSubmit}
                        disabled={pristine}
                    >
                        Save
                    </Button>
                </>
            )}
        >
            <SegmentInput
                className={styles.input}
                name="server-env"
                value={activeView}
                onChange={handleServerEnvironmentChange}
                options={serverOptions}
                keySelector={segmentKeySelector}
                labelSelector={segmentLabelSelector}
            />
            <Card className={_cs(styles.alphaForm, className)}>
                <NonFieldError error={error} />
                {(activeView === 'alpha' || activeView === 'beta') ? (
                    <>
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Identifier"
                            name="identifier"
                            value={valueToShow.identifier}
                            onChange={undefined}
                            readOnly
                        />
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Web Server Address"
                            name="webServer"
                            value={valueToShow.webServer}
                            onChange={undefined}
                            readOnly
                        />
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Api Server Address"
                            name="apiServer"
                            value={valueToShow.apiServer}
                            onChange={undefined}
                            readOnly
                        />
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Serverless Address"
                            name="serverless"
                            value={valueToShow.serverless}
                            onChange={undefined}
                            readOnly
                        />
                    </>
                ) : (
                    <>
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Identifier"
                            name="identifier"
                            value={valueToShow.identifier}
                            onChange={setFieldValue}
                            readOnly={disableInput}
                            error={error?.identifier}
                        />
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Web Server Address"
                            name="webServer"
                            value={valueToShow.webServer}
                            error={error?.webServer}
                            onChange={setFieldValue}
                            readOnly={disableInput}
                        />
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Api Server Address"
                            name="apiServer"
                            value={valueToShow.apiServer}
                            onChange={setFieldValue}
                            readOnly={disableInput}
                            error={error?.apiServer}
                        />
                        <TextInput
                            className={styles.input}
                            labelContainerClassName={styles.label}
                            label="Serverless Address"
                            name="serverless"
                            value={valueToShow.serverless}
                            onChange={setFieldValue}
                            readOnly={disableInput}
                            error={error?.serverless}
                        />
                    </>
                )}
            </Card>
        </ContainerCard>
    );
}

export default SourceSettings;
