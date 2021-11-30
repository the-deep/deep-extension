import React, { useContext, useMemo, useCallback, useState } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Card,
    Button,
    useAlert,
    Container,
} from '@the-deep/deep-ui';
import {
    removeNull,
    useForm,
    createSubmitHandler,
    internal,
    SetValueArg,
} from '@togglecorp/toggle-form';
import { useMutation, useQuery, gql } from '@apollo/client';

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
import { BasicProjectUser } from '../../components/selections/ProjectUserSelectInput';
import LeadInput from '../../components/LeadInput';
import { transformToFormError, ObjectError } from '../../Base/utils/errorTransform';

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
    // const { project } = useContext(ProjectContext);
    const { user } = useContext(UserContext);

    const initialValue: PartialFormType = useMemo(() => ({
        clientId: randomString(),
        sourceType: 'WEBSITE',
        priority: 'LOW',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
        assignee: user?.id,
    }), [user]);

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
        // pristine,
        value,
        setValue,
        error: riskyError,
        validate,
        setError,
    } = useForm(schema, initialValue);

    const {
        loading: leadOptionsLoading,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        LEAD_OPTIONS,
    );

    const {
        loading: recentProjectLoading,
        data: recentProject,
    } = useQuery<RecentProjectQuery, RecentProjectQueryVariables>(
        RECENT_PROJECT,
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

    const recentProjectID = recentProject?.me?.lastActiveProject?.id;
    console.log('Check Recent projects::>>', recentProjectID);

    const pending = leadOptionsLoading || leadCreatePending;

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                const data = { ...val } as LeadInputType;
                createLead({
                    variables: {
                        data,
                        projectId: recentProjectID as string,
                    },
                });
            },
        );
        submit();
    }, [setError, validate, createLead, recentProjectID]);

    const handleLeadChange = useCallback((newValue: SetValueArg<PartialFormType>) => {
        setValue(newValue, true);
    }, [setValue]);

    return (
        <Container
            className={_cs(className, styles.leadUrlBox)}
            heading="Add a source"
        >
            <Card className={styles.formContainer}>
                <LeadInput
                    name={undefined}
                    pending={pending}
                    value={value}
                    onChange={handleLeadChange}
                    projectId={recentProjectID}
                    error={riskyError}
                    defaultValue={initialValue}
                    priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                    hasAssessment={false}
                />
                <Button
                    className={styles.saveLead}
                    name="save"
                    // FIXME: Add disabled during pristine later
                    // disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            </Card>
        </Container>
    );
}

export default LeadModal;
