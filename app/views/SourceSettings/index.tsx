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
    webServerAddress: string;
    apiServerAddress: string;
    serverlessAddress: string;
    identifier: string;
}
type FormType = PartialForm<ServerConfigFields>;
type FormSchema = ObjectSchema<FormType>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        identifier: [requiredStringCondition],
        webServerAddress: [requiredStringCondition, urlCondition],
        apiServerAddress: [requiredStringCondition, urlCondition],
        serverlessAddress: [requiredStringCondition, urlCondition],
    }),
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

    const defaultForm: FormType = useMemo(() => {
        if (activeConfig === 'beta') {
            return {
                webServerAddress: productionValues.webServer,
                apiServerAddress: productionValues.apiServer,
                serverlessAddress: productionValues.serverLess,
                identifier: productionValues.identifier,
            };
        }
        if (activeConfig === 'alpha') {
            return {
                webServerAddress: alphaValues.webServer,
                apiServerAddress: alphaValues.apiServer,
                serverlessAddress: alphaValues.serverLess,
                identifier: alphaValues.identifier,
            };
        }
        return ({
            webServerAddress: otherConfig.webServerUrl,
            apiServerAddress: otherConfig.apiServerUrl,
            serverlessAddress: otherConfig.serverlessUrl,
            identifier: otherConfig.identifier,
        });
    }, [activeConfig, otherConfig]);

    const {
        pristine,
        value,
        error: settingsError,
        setValue,
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

    const handleSubmit = useCallback(
        (urlValue: FormType) => {
            if (activeView !== 'custom') {
                setSelectedConfig({
                    activeConfig: activeView,
                    webServerUrl: undefined,
                    apiServerUrl: undefined,
                    serverlessUrl: undefined,
                    identifier: undefined,
                });
            } else {
                setSelectedConfig({
                    activeConfig: activeView,
                    webServerUrl: urlValue.webServerAddress,
                    apiServerUrl: urlValue.apiServerAddress,
                    serverlessUrl: urlValue.serverlessAddress,
                    identifier: urlValue.identifier,
                });
            }
            history.push(route.settingsSuccessForm.path);
        },
        [
            activeView,
            setSelectedConfig,
            history,
        ],
    );

    const handleServerEnvironment = useCallback(
        (val: ConfigKeys) => {
            setActiveView(val);
            setValue(() => {
                if (val === 'beta') {
                    return {
                        webServerAddress: productionValues.webServer,
                        apiServerAddress: productionValues.apiServer,
                        serverlessAddress: productionValues.serverLess,
                        identifier: productionValues.identifier,
                    };
                }
                if (val === 'alpha') {
                    return {
                        webServerAddress: alphaValues.webServer,
                        apiServerAddress: alphaValues.apiServer,
                        serverlessAddress: alphaValues.serverLess,
                        identifier: alphaValues.identifier,
                    };
                }
                return {
                    webServerAddress: selectedConfig.webServerUrl,
                    apiServerAddress: selectedConfig.apiServerUrl,
                    serverlessAddress: selectedConfig.serverlessUrl,
                    identifier: selectedConfig.identifier,
                };
            });
            setPristine(false);
        },
        [
            selectedConfig,
            setValue,
            setPristine,
        ],
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
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
                            // FIXME: Add disabled during pristine later
                            name={undefined}
                            type="submit"
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
                    onChange={handleServerEnvironment}
                    options={serverOptions}
                    keySelector={segmentKeySelector}
                    labelSelector={segmentLabelSelector}
                />
                <Card className={_cs(styles.alphaForm, className)}>
                    <NonFieldError error={error} />
                    <TextInput
                        className={styles.input}
                        labelContainerClassName={styles.label}
                        label="Identifier"
                        name="identifier"
                        value={value.identifier}
                        onChange={setFieldValue}
                        readOnly={disableInput}
                        error={error?.identifier}
                    />
                    <TextInput
                        className={styles.input}
                        labelContainerClassName={styles.label}
                        label="Web Server Address"
                        name="webServerAddress"
                        value={value.webServerAddress}
                        error={error?.webServerAddress}
                        onChange={setFieldValue}
                        readOnly={disableInput}
                    />
                    <TextInput
                        className={styles.input}
                        labelContainerClassName={styles.label}
                        label="Api Server Address"
                        name="apiServerAddress"
                        value={value.apiServerAddress}
                        onChange={setFieldValue}
                        readOnly={disableInput}
                        error={error?.apiServerAddress}
                    />
                    <TextInput
                        className={styles.input}
                        labelContainerClassName={styles.label}
                        label="Serverless Address"
                        name="serverlessAddress"
                        value={value.serverlessAddress}
                        onChange={setFieldValue}
                        readOnly={disableInput}
                        error={error?.serverlessAddress}
                    />
                </Card>
            </ContainerCard>
        </form>
    );
}

export default SourceSettings;
