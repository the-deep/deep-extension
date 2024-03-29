import React, { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Button,
    Link,
    Kraken,
    Message,
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
import { IoCheckmarkCircle } from 'react-icons/io5';

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
    productionValues,
    stagingValues,
} from '#base/context/ServerContext';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import { BasicOrganization } from './SourceInput/NewOrganizationSelectInput';
import { BasicProject } from './SourceInput/ProjectSelectInput';
import { BasicLeadGroup } from './SourceInput/LeadGroupSelectInput';
import { BasicProjectUser } from './SourceInput/ProjectUserSelectInput';
import { schema, PartialFormType } from './SourceInput/schema';
import SourceInput from './SourceInput';
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
        leadConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
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
                isAssessmentEnabled
            }
        }
    }
`;

interface Props {
    className?: string;
}

interface ConfigProps {
    activeConfig: 'production' | 'staging' | 'custom';
    webServerUrl?: string;
    apiServerUrl?: string;
    serverlessUrl?: string;
    identifier?: string;
}

function getWebAddress(configMode: ConfigProps) {
    if (configMode.activeConfig === 'custom') {
        return configMode.webServerUrl;
    }
    if (configMode.activeConfig === 'production') {
        return productionValues.webServerUrl;
    }
    if (configMode.activeConfig === 'staging') {
        return stagingValues.webServerUrl;
    }
    return null;
}
function getIdentifier(configMode: ConfigProps) {
    if (configMode.activeConfig === 'custom') {
        return configMode.identifier;
    }
    if (configMode.activeConfig === 'production') {
        return productionValues.identifier;
    }
    if (configMode.activeConfig === 'staging') {
        return stagingValues.identifier;
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

    const initialValue: PartialFormType = useMemo(() => ({
        clientId: randomString(),
        sourceType: 'WEBSITE',
        priority: 'LOW',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
        assignee: user?.id,
        url: '',
        title: '',
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
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>(undefined);

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const {
        value,
        setValue,
        setFieldValue,
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

    const [successLeadId, setSuccessLeadId] = useState<string | undefined>(undefined);

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
                    result,
                } = response.project.leadCreate;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    setSuccessLeadId(result?.id);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'There was an issue creating a new source!',
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

    useEffect(() => {
        const url = getWebAddress(selectedConfig);

        if (url) {
            chrome.cookies.get(
                {
                    url,
                    name: `deep-${getIdentifier(selectedConfig)}-csrftoken`,
                }, (cookie: { value: string } | undefined | null) => {
                    if (cookie) {
                        setCsrfToken(cookie.value);
                    }
                    setCsrfTokenLoaded(true);
                },
            );
        }
        chrome.tabs.query({
            active: true,
            currentWindow: true,
        }, (tabs) => {
            const activeTab = tabs && tabs[0];
            if (activeTab?.url) {
                setFieldValue(activeTab.url, 'url');
                setFieldValue(activeTab?.title, 'title');
            }
        });
    }, [selectedConfig.activeConfig, selectedConfig, setFieldValue]);

    const currentUrl = useMemo(() => (
        getWebAddress(selectedConfig)
    ), [selectedConfig]);

    if (!csrfTokenLoaded) {
        return null;
    }

    if (successLeadId) {
        return (
            <Message
                message={(
                    <>
                        <p>
                            Source created successfully!
                            &nbsp;
                            <IoCheckmarkCircle />
                        </p>
                    </>
                )}
                icon={(
                    <Kraken
                        size="extraLarge"
                        variant="ballon"
                    />
                )}
                actions={(
                    <Link
                        // NOTE: Undefined is set for entries, that will redirect
                        // to entry tagging page without any entry selected
                        to={`${currentUrl}/permalink/projects/${recentProjectId}/leads/${successLeadId}/entries/undefined`}
                    >
                        Add Entry
                    </Link>
                )}
            />
        );
    }

    return (
        <ContainerCard
            className={_cs(className, styles.leadUrlBox)}
            contentClassName={styles.content}
            footerActions={(
                <Button
                    name="save"
                    disabled={pending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {projectOptions ? (
                <SourceInput
                    csrfToken={csrfToken}
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
                    confidentialityOptions={
                        leadOptions?.leadConfidentialityOptions?.enumValues
                    }
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                    leadGroupOptions={leadGroupOptions}
                    onLeadGroupOptionsChange={setLeadGroupOptions}
                />
            ) : (
                <Message
                    pending={pending}
                    pendingMessage="Fetching project options..."
                    message="Failed to fetch project options."
                />
            )}
        </ContainerCard>
    );
}

export default SourceForm;
