import React, { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Button,
    useAlert,
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    removeNull,
    useForm,
    createSubmitHandler,
    internal,
    SetValueArg,
} from '@togglecorp/toggle-form';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { schema, PartialFormType } from '#components/SourceInput/schema';
import {
    LeadOptionsQuery,
    LeadOptionsQueryVariables,
    LeadInputType,
    LeadCreateMutation,
    LeadCreateMutationVariables,
    RecentProjectQuery,
    RecentProjectQueryVariables,
} from '#generated/types';
import { UserContext } from '#base/context/UserContext';
import {
    ServerContext,
} from '#base/context/serverContext';
import { productionValues, alphaValues } from '#base/utils/apollo';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProject } from '#components/selections/ProjectSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import SourceInput from '#components/SourceInput';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import route from '#base/configs/routes';

import styles from './styles.css';

// TODO: Show attachment's title and link if lead is attachment type

const SOURCE_OPTIONS = gql`
    query LeadOptions {
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

const SOURCE_FRAGMENT = gql`
    fragment LeadResponse on LeadType {
        id
        title
        clientId
        leadGroup {
            id
            title
        }
        title
        assignee {
            id
            displayName
        }
        publishedOn
        text
        url
        website
        attachment {
            id
            title
            mimeType
            file {
                url
            }
        }
        isAssessmentLead
        sourceType
        priority
        confidentiality
        status
        source {
            id
            title
            mergedAs {
                id
                title
            }
        }
        authors {
            id
            title
            mergedAs {
                id
                title
            }
        }
        emmEntities {
            id
            name
        }
        emmTriggers {
            id
            emmKeyword
            emmRiskFactor
            count
        }
    }
`;

const SOURCE_CREATE = gql`
    ${SOURCE_FRAGMENT}
    mutation LeadCreate(
        $projectId: ID!,
        $data: LeadInputType!,
    ) {
        project(id: $projectId) {
            id
            leadCreate(data: $data) {
                ok
                errors
                result {
                    ...LeadResponse
                }
            }
        }
    }
`;

const RECENT_PROJECT = gql`
    query RecentProject {
        me {
            lastActiveProject {
                id
                title
                isPrivate
            }
        }
    }
`;

interface Props {
    className?: string;
}

interface ConfigProps {
    activeConfig: 'beta' | 'alpha' | 'custom';
    webServerUrl?: string;
    apiServerUrl?: string;
    serverlessUrl?: string;
    identifier?: string;
}

function getWebAddress(configMode: ConfigProps) {
    if (configMode.activeConfig === 'custom') {
        return configMode.webServerUrl;
    }
    if (configMode.activeConfig === 'alpha') {
        return alphaValues.webServer;
    }
    if (configMode.activeConfig === 'beta') {
        return productionValues.webServer;
    }
    return null;
}
function getIdentifier(configMode: ConfigProps) {
    if (configMode.activeConfig === 'custom') {
        return configMode.identifier;
    }
    if (configMode.activeConfig === 'alpha') {
        return alphaValues.identifier;
    }
    if (configMode.activeConfig === 'beta') {
        return productionValues.identifier;
    }
    return null;
}

function SourceForm(props: Props) {
    const {
        className,
    } = props;
    const alert = useAlert();
    const { user } = useContext(UserContext);
    const { selectedConfig } = useContext(ServerContext);

    const history = useHistory();

    const initialValue: PartialFormType = useMemo(() => ({
        clientId: randomString(),
        sourceType: 'WEBSITE',
        priority: 'LOW',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
        assignee: user?.id,
    }), [user]);

    const [
        recentProjectId,
        setRecentProjectId,
    ] = useState<string | undefined>();

    const [
        projectOptions,
        setProjectOptions,
    ] = useState<BasicProject[] | undefined | null>();

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>(user ? [user] : undefined);

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const {
        value,
        setValue,
        error: riskyError,
        validate,
        setError,
        // pristine,
    } = useForm(schema, initialValue);

    const {
        loading: leadOptionsLoading,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        SOURCE_OPTIONS,
    );

    const {
        loading: recentProjectLoading,
    } = useQuery<RecentProjectQuery, RecentProjectQueryVariables>(
        RECENT_PROJECT,
        {
            onCompleted: (response) => {
                if (response) {
                    const recentProjectInfo = response.me?.lastActiveProject;
                    setRecentProjectId(recentProjectInfo?.id);
                    setProjectOptions(recentProjectInfo ? [recentProjectInfo] : undefined);
                }
            },
        },
    );

    const [
        createLead,
        {
            loading: leadCreatePending,
        },
    ] = useMutation<LeadCreateMutation, LeadCreateMutationVariables>(
        SOURCE_CREATE,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadCreate) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = response.project.leadCreate;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    history.push(route.successForm.path);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'There was an issue creating a new lead!',
                    { variant: 'error' },
                );
            },
        },
    );

    const pending = recentProjectLoading || leadOptionsLoading || leadCreatePending;

    const handleSubmit = useCallback(() => {
        if (!recentProjectId) {
            return;
        }
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                const data = { ...val } as LeadInputType;
                createLead({
                    variables: {
                        data,
                        projectId: recentProjectId,
                    },
                });
            },
        );
        submit();
    }, [setError, validate, createLead, recentProjectId]);

    const handleLeadChange = useCallback((newValue: SetValueArg<PartialFormType>) => {
        setValue(newValue);
    }, [setValue]);

    const [csrfToken, setCsrfToken] = useState<string | undefined>();
    const [csrfTokenLoaded, setCsrfTokenLoaded] = useState(false);
    const [
        currentTabInfo,
        setCurrentTabInfo,
    ] = useState<{ url: string, title: string } | undefined>();

    useEffect(() => {
        chrome.cookies.get(
            {
                url: getWebAddress(selectedConfig),
                name: `deep-${getIdentifier(selectedConfig)}-csrftoken`,
            }, (cookie: { value: string } | undefined) => {
                if (cookie) {
                    setCsrfToken(cookie.value);
                }
                setCsrfTokenLoaded(true);
            },
        );
        chrome.tabs.query({
            active: true,
            currentWindow: true,
        }, (tabs: { url: string, title: string }[] | undefined) => {
            const tabURL: { url: string, title: string } | undefined = tabs && tabs[0];
            if (tabURL) {
                setCurrentTabInfo(tabURL);
            }
        });
    }, [selectedConfig.activeConfig, selectedConfig]);

    if (!csrfTokenLoaded) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(className, styles.leadUrlBox)}
            footerActions={(
                <Button
                    name="save"
                    // FIXME: Add disabled during pristine later
                    disabled={pending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {projectOptions && (
                <SourceInput
                    csrfToken={csrfToken}
                    currentTabInfo={currentTabInfo}
                    name={undefined}
                    pending={pending}
                    value={value}
                    onChange={handleLeadChange}
                    projectId={recentProjectId}
                    setProjectId={setRecentProjectId}
                    projectOptions={projectOptions}
                    setProjectOptions={setProjectOptions}
                    error={riskyError}
                    defaultValue={initialValue}
                    priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                />
            )}
        </ContainerCard>
    );
}

export default SourceForm;
