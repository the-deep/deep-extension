import React, { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Card,
    Button,
    useAlert,
    Container,
    Heading,
} from '@the-deep/deep-ui';
import {
    removeNull,
    useForm,
    createSubmitHandler,
    internal,
    SetValueArg,
} from '@togglecorp/toggle-form';
import { IoLogoChrome, IoSettings } from 'react-icons/io5';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { schema, PartialFormType } from '../../components/LeadInput/schema';
import {
    LeadOptionsQuery,
    LeadOptionsQueryVariables,
    LeadInputType,
    LeadCreateMutation,
    LeadCreateMutationVariables,
    RecentProjectQuery,
    RecentProjectQueryVariables,
} from '#generated/types';
import { UserContext } from '../../Base/context/UserContext';
import { BasicOrganization } from '../../components/selections/NewOrganizationSelectInput';
import { BasicProject } from '../../components/selections/ProjectSelectInput';
import { BasicProjectUser } from '../../components/selections/ProjectUserSelectInput';
import LeadInput from '../../components/LeadInput';
import { transformToFormError, ObjectError } from '../../Base/utils/errorTransform';
import route from '../../Base/configs/routes';

import styles from './styles.css';

// TODO: Show attachment's title and link if lead is attachment type

const LEAD_OPTIONS = gql`
    query LeadOptions {
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

const LEAD_FRAGMENT = gql`
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

const LEAD_CREATE = gql`
    ${LEAD_FRAGMENT}
    mutation LeadCreate(
        $projectId: ID!,
        $data: LeadInputType!,
    ) {
        project(id: $projectId) {
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

function LeadModal(props: Props) {
    const {
        className,
    } = props;
    const alert = useAlert();
    const { user } = useContext(UserContext);

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

    const [
        cookieBox,
        setCookieBox,
    ] = useState<undefined | null>();
    console.log('In cookie center::>>', cookieBox);

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
        LEAD_OPTIONS,
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
        LEAD_CREATE,
        {
            refetchQueries: ['ProjectSources'],
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
                    alert.show(
                        'Successfully created lead!',
                        { variant: 'success' },
                    );
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
            console.error('No project defined.');
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
        setValue(newValue, true);
    }, [setValue]);

    const handleLeadSettings = useCallback(
        () => {
            history.push(route.leadSettings.path);
        }, [history],
    );

    useEffect(() => {
        if (chrome.cookies) {
            chrome.cookies.get(
                {
                    url: 'http://localhost:3000',
                    name: 'deep-development-sessionid',
                },
                (cookieValue) => {
                    setCookieBox(cookieValue);
                    console.log('The latest cookie value::>>>', cookieValue);
                },
            );
        }
    }, []);

    return (
        <Container
            className={_cs(className, styles.leadUrlBox)}
        >
            <Card
                className={styles.formContainer}
            >
                {projectOptions && (
                    <>
                        <div className={styles.cardHead}>
                            <Heading
                                className={styles.leftHeader}
                                size="medium"
                            >
                                Add Lead
                            </Heading>
                            <Heading
                                className={styles.rightHeader}
                                size="large"
                            >
                                <IoSettings onClick={handleLeadSettings} />
                            </Heading>
                        </div>
                        <LeadInput
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

                        <Button
                            className={styles.saveLeadButton}
                            name="save"
                            // FIXME: Add disabled during pristine later
                            disabled={pending}
                            onClick={handleSubmit}
                        >
                            Save
                        </Button>
                    </>
                )}
            </Card>
        </Container>
    );
}

export default LeadModal;
