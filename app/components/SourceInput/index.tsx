import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import produce from 'immer';
import {
    Checkbox,
    PendingMessage,
    TextInput,
    DateInput,
    SegmentInput,
    QuickActionButton,
    useBooleanState,
    useAlert,
} from '@the-deep/deep-ui';
import {
    Error,
    getErrorObject,
    getErrorString,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    IoAdd,
    IoEye,
} from 'react-icons/io5';

import { useLazyRequest } from '#base/utils/restRequest';
import ProjectSelectInput, { BasicProject } from '../selections/ProjectSelectInput';
import NewOrganizationSelectInput, { BasicOrganization } from '../selections/NewOrganizationSelectInput';
import AddLeadGroupModal from '#components/AddLeadGroupModal';
import LeadGroupSelectInput, { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import ProjectUserSelectInput, { BasicProjectUser } from '../selections/ProjectUserSelectInput';
import NewOrganizationMultiSelectInput from '../selections/NewOrganizationMultiSelectInput';
import AddOrganizationModal from '../general/AddOrganizationModal';
import NonFieldError from '../NonFieldError';
import {
    enumKeySelector,
    enumLabelSelector,
} from '../../utils/common';
import {
    OrganizationDetails,
} from '../../types/organization';
import {
    TokenQuery,
    LeadOptionsQuery,
} from '#generated/types';

import { PartialFormType } from './schema';
import ConfidentialityInput from './ConfidentialityInput';
import EmmStats from './EmmStats';

import styles from './styles.css';

// FIXME: Use translations throughout the page

const TOKEN = gql`
    query Token {
        me {
            id
            jwtToken {
                accessToken
                expiresIn
            }
        }
    }
`;

interface RawWebInfo {
    title?: string;
    date?: string;
    website?: string;
    country?: string;
    sourceRaw?: string;
    authorRaw?: string;
}

interface WebInfoBody {
    url?: string;
    title?: string;
    date?: string;
    website?: string;
    country?: string;
    source?: string;
    author?: string;
    sourceRaw?: string;
    authorRaw?: string;
}

interface WebInfo {
    date?: string;
    website?: string;
    title?: string;
    url?: string;
    source?: OrganizationDetails;
    author?: OrganizationDetails;
}

interface Props<N extends string | number | undefined> {
    name: N;
    className?: string;
    onChange: (value: SetValueArg<PartialFormType>, name: N) => void;
    value: PartialFormType;
    error: Error<PartialFormType> | undefined;
    pending?: boolean;
    projectId: string | undefined;
    setProjectId: React.Dispatch<React.SetStateAction<string | undefined>>;
    projectOptions: BasicProject[];
    setProjectOptions: React.Dispatch<React.SetStateAction<BasicProject[] | undefined | null>>;
    disabled?: boolean;
    defaultValue: PartialFormType;
    priorityOptions: NonNullable<LeadOptionsQuery['leadPriorityOptions']>['enumValues'] | undefined;
    sourceOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onLeadGroupOptionsChange: React.Dispatch<React.SetStateAction<BasicLeadGroup[] | undefined | null>>;
    leadGroupOptions: BasicLeadGroup[] | undefined | null;
    // eslint-disable-next-line max-len
    onSourceOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    authorOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onAuthorOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    assigneeOptions: BasicProjectUser[] | undefined | null;
    // eslint-disable-next-line max-len
    onAssigneeOptionChange: React.Dispatch<React.SetStateAction<BasicProjectUser[] | undefined | null>>;
    pendingLeadOptions?: boolean;
    csrfToken: string | undefined;
    currentTabInfo: { url: string, title?: string } | undefined;
}

function SourceInput<N extends string | number | undefined>(props: Props<N>) {
    const {
        name,
        className,
        value,
        onChange,
        error: riskyError,
        defaultValue,
        pending: pendingFromProps,
        projectOptions,
        setProjectOptions,
        projectId,
        setProjectId,
        disabled,
        priorityOptions,
        pendingLeadOptions,
        leadGroupOptions,
        sourceOrganizationOptions,
        onSourceOrganizationOptionsChange,
        authorOrganizationOptions,
        onAuthorOrganizationOptionsChange,
        assigneeOptions,
        onLeadGroupOptionsChange,
        onAssigneeOptionChange,
        csrfToken,
        currentTabInfo,
    } = props;

    const selectedProjectData = useMemo(() => {
        if (!projectId) {
            return undefined;
        }
        return projectOptions?.find((p) => p.id === projectId);
    }, [projectId, projectOptions]);

    const alert = useAlert();

    const error = getErrorObject(riskyError);
    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const [
        organizationAddType,
        setOrganizationAddType,
    ] = useState<'author' | 'publisher' | undefined>(undefined);

    const [
        showAddOrganizationModal,
        setShowAddOrganizationModalTrue,
        setShowAddOrganizationModalFalse,
    ] = useBooleanState(false);

    const [
        showAddLeadGroupModal,
        setShowAddLeadAddGroupModal,
        setShowAddLeadGroupModalFalse,
    ] = useBooleanState(false);

    const handleAddLeadGroupClick = useCallback(() => {
        setShowAddLeadAddGroupModal();
    }, [setShowAddLeadAddGroupModal]);

    const handleInfoAutoFill = useCallback((webInfo: WebInfo) => {
        onChange((oldValues = defaultValue) => {
            const newValues = produce(oldValues, (safeValues) => {
                if (webInfo.date) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.publishedOn = webInfo.date;
                }
                if (webInfo.website) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.website = webInfo.website;
                }
                if (webInfo.title) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.title = webInfo.title;
                }
                if (webInfo.url) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.url = webInfo.url;
                }
                if (webInfo.source) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.source = String(webInfo.source.id);
                }
                if (webInfo.author) {
                    // FIXME: we have to look into this
                    // eslint-disable-next-line no-param-reassign
                    safeValues.authors = [String(webInfo.author.id)].filter(isDefined);
                }
            });
            return newValues;
        }, name);
        if (webInfo.source) {
            const transformedSource = {
                id: String(webInfo.source.id),
                title: String(webInfo.source.title),
            };
            onSourceOrganizationOptionsChange(
                (oldVal) => [...oldVal ?? [], transformedSource].filter(isDefined),
            );
        }
        if (webInfo.author) {
            const transformedAuthor = {
                id: String(webInfo.author.id),
                title: String(webInfo.author.title),
            };
            onAuthorOrganizationOptionsChange(
                (oldVal) => [...oldVal ?? [], transformedAuthor].filter(isDefined),
            );
        }
    }, [
        defaultValue,
        name,
        onChange,
        onSourceOrganizationOptionsChange,
        onAuthorOrganizationOptionsChange,
    ]);

    const handleLeadGroupAdd = useCallback((val: BasicLeadGroup) => {
        setFieldValue(val.id, 'leadGroup');
        onLeadGroupOptionsChange((oldVal) => [...oldVal ?? [], val]);
    }, [setFieldValue, onLeadGroupOptionsChange]);

    const handleProjectChange = useCallback((projectVal) => {
        setProjectId(projectVal);
        setFieldValue(null, 'assignee');
    }, [setFieldValue, setProjectId]);

    const {
        pending: webInfoPending,
        trigger: getWebInfo,
    } = useLazyRequest<WebInfo, WebInfoBody>({
        method: 'POST',
        url: 'server://v2/web-info-data/',
        body: (ctx) => ctx,
        other: () => ({
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                origin: 'alpha-2.thedeep.io',
            },
        }),
        onSuccess: (response, ctx) => {
            handleInfoAutoFill({
                date: ctx.date,
                website: ctx.website,
                title: ctx.title,
                url: ctx.url,
                ...response,
            });
        },
        onFailure: () => {
            alert.show(
                'Sorry, cannot generate source info right now!',
                { variant: 'error' },
            );
        },
        failureHeader: 'Web Info Extract',
    });

    const {
        pending: rawWebInfoPending,
        trigger: getRawWebInfo,
    } = useLazyRequest<RawWebInfo, { url: string; token: string }>({
        method: 'GET',
        url: 'serverless://web-info-extract/',
        query: (ctx) => ({ url: ctx.url }),
        other: (ctx) => ({
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                'X-CSRFToken': csrfToken as string,
            },
        }),
        onSuccess: (response, ctx) => {
            if (response) {
                getWebInfo({
                    url: ctx.url,
                    title: response.title,
                    date: response.date,
                    website: response.website,
                    country: response.country,
                    sourceRaw: response.sourceRaw,
                    authorRaw: response.authorRaw,
                });
            }
        },
        failureHeader: 'Raw Web Info Extract',
    });

    const [getUserToken, { loading: pendingUserToken }] = useLazyQuery<TokenQuery>(
        TOKEN,
        {
            fetchPolicy: 'network-only',
            onCompleted: (data) => {
                const token = data.me?.jwtToken?.accessToken;
                if (!token) {
                    return;
                }

                if (value.url) {
                    getRawWebInfo({
                        url: value.url,
                        token,
                    });
                }
            },
        },
    );

    const handleAddPublishingOrganizationsClick = useCallback(() => {
        setShowAddOrganizationModalTrue();
        setOrganizationAddType('publisher');
    }, [setShowAddOrganizationModalTrue]);

    const handleAddAuthorOrganizationsClick = useCallback(() => {
        setShowAddOrganizationModalTrue();
        setOrganizationAddType('author');
    }, [setShowAddOrganizationModalTrue]);

    const handleLeadDataExtract = useCallback(() => {
        getUserToken();
    }, [getUserToken]);

    const handleOrganizationAdd = useCallback((val: { id: number; title: string }) => {
        const transformedVal = {
            id: String(val.id),
            title: val.title,
        };
        if (organizationAddType === 'publisher') {
            setFieldValue(transformedVal.id, 'source');
            onSourceOrganizationOptionsChange((oldVal) => [...oldVal ?? [], transformedVal]);
        } else if (organizationAddType === 'author') {
            setFieldValue((oldVal: string[] | undefined | null) => [...oldVal ?? [], transformedVal.id], 'authors');
            onAuthorOrganizationOptionsChange((oldVal) => [...oldVal ?? [], transformedVal]);
        }
    }, [
        organizationAddType,
        setFieldValue,
        onSourceOrganizationOptionsChange,
        onAuthorOrganizationOptionsChange,
    ]);

    const pending = pendingFromProps || pendingUserToken || webInfoPending || rawWebInfoPending;

    useEffect(() => {
        if (currentTabInfo) {
            handleInfoAutoFill({
                url: currentTabInfo.url,
                title: currentTabInfo.title,
            });
        }
    }, [currentTabInfo, handleInfoAutoFill]);

    return (
        <div className={_cs(styles.leadEditForm, className)}>
            {pending && <PendingMessage />}
            <NonFieldError error={error} />
            <ProjectSelectInput
                name="project"
                label="Project"
                value={projectId}
                onChange={handleProjectChange}
                options={projectOptions}
                onOptionsChange={setProjectOptions}
                nonClearable
            />
            <TextInput
                label="URL"
                name="url"
                value={value.url}
                onChange={setFieldValue}
                error={error?.url}
                readOnly={!!value.id}
                disabled={disabled}
                actions={(
                    <QuickActionButton
                        name="leadExtract"
                        variant="action"
                        onClick={handleLeadDataExtract}
                        title="Auto-fill source information"
                        disabled={!value.url}
                    >
                        <IoEye />
                    </QuickActionButton>
                )}
            />
            <TextInput
                label="Website"
                name="website"
                value={value.website}
                onChange={setFieldValue}
                error={error?.website}
                disabled={disabled}
            />
            <TextInput
                label="Title"
                name="title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
                disabled={disabled}
            />
            <div className={styles.row}>
                <DateInput
                    className={styles.rowInput}
                    label="Published On"
                    name="publishedOn"
                    value={value.publishedOn}
                    onChange={setFieldValue}
                    error={error?.publishedOn}
                    disabled={disabled}
                />
                <ProjectUserSelectInput
                    className={styles.rowInput}
                    disabled={pendingLeadOptions || disabled || !projectId}
                    error={error?.assignee}
                    label="Assignee"
                    name="assignee"
                    onChange={setFieldValue}
                    onOptionsChange={onAssigneeOptionChange}
                    options={assigneeOptions}
                    value={value.assignee}
                    projectId={projectId as string}
                />
            </div>
            <div className={styles.row}>
                <NewOrganizationSelectInput
                    className={styles.rowInput}
                    name="source"
                    value={value.source}
                    onChange={setFieldValue}
                    options={sourceOrganizationOptions}
                    onOptionsChange={onSourceOrganizationOptionsChange}
                    disabled={pendingLeadOptions || disabled}
                    label="Publishing Organization"
                    // eslint-disable-next-line max-len
                    // hint={isTruthyString(value.sourceRaw) && `Previous organization: ${value.sourceRaw}`}
                    error={error?.source}
                    actions={(
                        <QuickActionButton
                            name="Add organizations"
                            variant="transparent"
                            onClick={handleAddPublishingOrganizationsClick}
                            disabled={pendingLeadOptions || disabled}
                            title="Add new organization"
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
                <NewOrganizationMultiSelectInput
                    className={styles.rowInput}
                    name="authors"
                    value={value.authors}
                    onChange={setFieldValue}
                    options={authorOrganizationOptions}
                    onOptionsChange={onAuthorOrganizationOptionsChange}
                    disabled={pendingLeadOptions || disabled}
                    label="Authoring Organizations"
                    // eslint-disable-next-line max-len
                    // hint={isTruthyString(value.authorRaw) && `Previous organization: ${value.authorRaw}`}
                    error={getErrorString(error?.authors)}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            title="Add new organization"
                            variant="transparent"
                            onClick={handleAddAuthorOrganizationsClick}
                            disabled={pendingLeadOptions || disabled}
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
            </div>
            {selectedProjectData?.hasAssessmentTemplate && (
                <LeadGroupSelectInput
                    // FIXME: Filter this out based on if the project has assessment or not
                    name="leadGroup"
                    value={value.leadGroup}
                    onChange={setFieldValue}
                    options={leadGroupOptions}
                    onOptionsChange={onLeadGroupOptionsChange}
                    disabled={disabled}
                    label="Source Group"
                    error={error?.leadGroup}
                    projectId={projectId}
                    actions={(
                        <QuickActionButton
                            name={undefined}
                            variant="transparent"
                            onClick={handleAddLeadGroupClick}
                            disabled={disabled}
                            title="Add source group"
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
            )}
            <div className={styles.priorityRow}>
                <SegmentInput
                    name="priority"
                    label="Priority"
                    value={value.priority}
                    onChange={setFieldValue}
                    options={priorityOptions ?? undefined}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={error?.priority}
                    disabled={disabled}
                />
                <div className={styles.checkboxes}>
                    <ConfidentialityInput
                        name="confidentiality"
                        value={value.confidentiality ?? undefined}
                        onChange={setFieldValue}
                        label="Confidential"
                        disabled={disabled}
                    />
                    {selectedProjectData?.hasAssessmentTemplate && (
                        <Checkbox
                            name="isAssessmentLead"
                            value={value.isAssessmentLead}
                            onChange={setFieldValue}
                            label="Is Assessment"
                            disabled={disabled}
                        />
                    )}
                </div>
            </div>
            <EmmStats
                emmTriggers={value.emmTriggers}
                emmEntities={value.emmEntities}
            />
            {showAddOrganizationModal && (
                <AddOrganizationModal
                    onModalClose={setShowAddOrganizationModalFalse}
                    onOrganizationAdd={handleOrganizationAdd}
                />
            )}
            {showAddLeadGroupModal && projectId && (
                <AddLeadGroupModal
                    onModalClose={setShowAddLeadGroupModalFalse}
                    activeProject={+projectId}
                    onLeadGroupAdd={handleLeadGroupAdd}
                    csrfToken={csrfToken}
                />
            )}
        </div>
    );
}

export default SourceInput;
