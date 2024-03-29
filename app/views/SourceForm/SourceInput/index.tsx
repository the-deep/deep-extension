import React, { useMemo, useState, useCallback } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import produce from 'immer';
import {
    Checkbox,
    PendingMessage,
    TextInput,
    DateInput,
    BadgeInput,
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
    IoCopyOutline,
    IoEye,
} from 'react-icons/io5';

import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    OrganizationDetails,
} from '#types/organization';
import {
    TokenQuery,
    LeadOptionsQuery,
} from '#generated/types';

import { BasicLeadGroup } from './LeadGroupSelectInput';
import ProjectSelectInput, { BasicProject } from './ProjectSelectInput';
import NewOrganizationSelectInput, { BasicOrganization } from './NewOrganizationSelectInput';
import ProjectUserSelectInput, { BasicProjectUser } from './ProjectUserSelectInput';
import NewOrganizationMultiSelectInput from './NewOrganizationMultiSelectInput';
import AddOrganizationModal from './AddOrganizationModal';
// import AddLeadGroupModal from './AddLeadGroupModal';
import EmmStats from './EmmStats';

import { PartialFormType } from './schema';
import styles from './styles.css';

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

interface KeyValue {
    key: string;
    value: string;
}
const optionKeySelector = (option: KeyValue) => option.key;
const optionLabelSelector = (option: KeyValue) => option.value.match(/(?:.+\/)(.+)/)?.[1] ?? option.value;

interface RawWebInfo {
    title?: string;
    date?: string;
    country?: string;
    sourceRaw?: string;
    authorsRaw?: string[];
    pdfUrls?: string[];
}

interface WebInfoBody {
    url?: string;
    title?: string;
    date?: string;
    country?: string;
    source?: string;
    author?: string;
    sourceRaw?: string;
    authorsRaw?: string[];
 }

interface WebInfo {
    date?: string;
    title?: string;
    url?: string;
    source?: OrganizationDetails;
    authors?: OrganizationDetails[];
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
    confidentialityOptions: NonNullable<LeadOptionsQuery['leadConfidentialityOptions']>['enumValues'] | undefined;
    sourceOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len, react/no-unused-prop-types
    onLeadGroupOptionsChange: React.Dispatch<React.SetStateAction<BasicLeadGroup[] | undefined | null>>;
    // eslint-disable-next-line react/no-unused-prop-types
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
        confidentialityOptions,
        pendingLeadOptions,
        sourceOrganizationOptions,
        onSourceOrganizationOptionsChange,
        authorOrganizationOptions,
        onAuthorOrganizationOptionsChange,
        assigneeOptions,
        // leadGroupOptions,
        // onLeadGroupOptionsChange,
        onAssigneeOptionChange,
        csrfToken,
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

    const [selectedPdf, setSelectedPdf] = useState<string>();
    const [
        pdfUrlOptions,
        setPdfUrlOptions,
    ] = useState<KeyValue[] | undefined>();

    const [
        organizationAddType,
        setOrganizationAddType,
    ] = useState<'author' | 'publisher' | undefined>(undefined);

    const [
        showAddOrganizationModal,
        setShowAddOrganizationModalTrue,
        setShowAddOrganizationModalFalse,
    ] = useBooleanState(false);

    /*
    const [
        showAddLeadGroupModal,
        setShowAddLeadAddGroupModal,
        setShowAddLeadGroupModalFalse,
    ] = useBooleanState(false);
    */

    const handleInfoAutoFill = useCallback((webInfo: WebInfo) => {
        onChange((oldValues = defaultValue) => {
            const newValues = produce(oldValues, (safeValues) => {
                if (webInfo.date) {
                    // eslint-disable-next-line no-param-reassign
                    safeValues.publishedOn = webInfo.date;
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
                if (webInfo.authors) {
                    const authors = webInfo.authors.filter((author) => isDefined(author.id))
                        .map((author) => String(author.id));
                    // eslint-disable-next-line no-param-reassign
                    safeValues.authors = authors;
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
        if (webInfo.authors) {
            const transformedAuthors = webInfo.authors.map((author) => ({
                id: String(author.id),
                title: author.mergedAs ? author.mergedAs.title : author.title,
            }));
            onAuthorOrganizationOptionsChange(
                (oldVal) => [...oldVal ?? [], ...transformedAuthors].filter(isDefined),
            );
        }
    }, [
        defaultValue,
        name,
        onChange,
        onSourceOrganizationOptionsChange,
        onAuthorOrganizationOptionsChange,
    ]);

    /*
    const handleLeadGroupAdd = useCallback((val: BasicLeadGroup) => {
        setFieldValue(val.id, 'leadGroup');
        onLeadGroupOptionsChange((oldVal) => [...oldVal ?? [], val]);
    }, [setFieldValue, onLeadGroupOptionsChange]);
    */

    const handleProjectChange = useCallback((projectVal) => {
        setProjectId(projectVal);
        setFieldValue(null, 'assignee');
        setFieldValue(null, 'leadGroup');
    }, [setFieldValue, setProjectId]);

    const filteredConfidentialityOptions = useMemo(() => (
        confidentialityOptions?.filter((item) => item.name !== 'CONFIDENTIAL')
    ), [confidentialityOptions]);

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
                if ((response?.pdfUrls?.length ?? 0) > 0) {
                    const options = response.pdfUrls?.map((pdfUrl) => ({
                        key: pdfUrl,
                        value: pdfUrl,
                    }));

                    const urlOption = { key: ctx.url, value: ctx.url };

                    setSelectedPdf(ctx.url);
                    setPdfUrlOptions([urlOption, ...(options ?? [])]);
                }

                getWebInfo({
                    url: ctx.url,
                    title: response.title,
                    date: response.date,
                    country: response.country,
                    sourceRaw: response.sourceRaw,
                    authorsRaw: response.authorsRaw,
                });
            }
        },
        failureHeader: 'Raw Web Info Extract',
    });

    const {
        loading: userTokenPending,
        refetch: refetchTokenAndExtract,
    } = useQuery<TokenQuery>(
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
            skip: isNotDefined(value.url),
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

    const handleAddPublisherAsAuthor = useCallback(() => {
        if (value.source) {
            onAuthorOrganizationOptionsChange((oldValue) => (
                [...(oldValue ?? []), ...(sourceOrganizationOptions ?? [])]
            ));
            setFieldValue([value.source], 'authors');
        }
    }, [value, setFieldValue, onAuthorOrganizationOptionsChange, sourceOrganizationOptions]);

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

    const handleLeadExtractClick = useCallback(() => {
        refetchTokenAndExtract();
    }, [refetchTokenAndExtract]);

    const handlePdfSelect = useCallback((pdfUrl) => {
        setSelectedPdf(pdfUrl);
        setFieldValue(pdfUrl, 'url');
    }, [setFieldValue]);

    const pending = pendingFromProps || userTokenPending || webInfoPending || rawWebInfoPending;

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
                        onClick={handleLeadExtractClick}
                        title="Auto-fill source information"
                        disabled={!value.url || userTokenPending || rawWebInfoPending}
                    >
                        <IoEye />
                    </QuickActionButton>
                )}
            />
            {pdfUrlOptions && (
                <BadgeInput
                    listClassName={styles.badgeInput}
                    value={selectedPdf}
                    name="selectedPdf"
                    label="Other sources:"
                    options={pdfUrlOptions}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    onChange={handlePdfSelect}
                    selectedButtonVariant="primary"
                    buttonVariant="tertiary"
                    selectedValueHidden
                    smallButtons
                />
            )}
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
                    showInModal
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
                        <>
                            <QuickActionButton
                                name="add publishing organization"
                                title="Add publishing organization as author"
                                variant="transparent"
                                onClick={handleAddPublisherAsAuthor}
                                disabled={
                                    pendingLeadOptions || disabled || isNotDefined(value.source)
                                }
                            >
                                <IoCopyOutline />
                            </QuickActionButton>
                            <QuickActionButton
                                name="add organizations"
                                title="Add new organization"
                                variant="transparent"
                                onClick={handleAddAuthorOrganizationsClick}
                                disabled={pendingLeadOptions || disabled}
                            >
                                <IoAdd />

                            </QuickActionButton>
                        </>
                    )}
                />
            </div>
            {selectedProjectData?.isAssessmentEnabled && (
                <div className={_cs(styles.row, styles.aryRow)}>
                    {/*
                    <LeadGroupSelectInput
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
                                onClick={setShowAddLeadAddGroupModal}
                                disabled={disabled}
                                title="Add source group"
                            >
                                <IoAdd />

                            </QuickActionButton>
                        )}
                    />
                    */}
                    <Checkbox
                        name="isAssessmentLead"
                        value={value.isAssessmentLead}
                        onChange={setFieldValue}
                        label="Is assessment"
                        disabled={disabled}
                    />
                </div>
            )}
            <div className={styles.row}>
                <SegmentInput
                    name="confidentiality"
                    value={value.confidentiality}
                    className={styles.rowInput}
                    options={filteredConfidentialityOptions ?? undefined}
                    onChange={setFieldValue}
                    label="Confidentiality"
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={error?.confidentiality}
                    disabled={disabled}
                    spacing="compact"
                />
                <SegmentInput
                    name="priority"
                    label="Priority"
                    className={styles.rowInput}
                    value={value.priority}
                    options={priorityOptions ?? undefined}
                    onChange={setFieldValue}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    error={error?.priority}
                    disabled={disabled}
                    spacing="compact"
                />
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
            {/* showAddLeadGroupModal && projectId && (
                <AddLeadGroupModal
                    onModalClose={setShowAddLeadGroupModalFalse}
                    activeProject={+projectId}
                    onLeadGroupAdd={handleLeadGroupAdd}
                    csrfToken={csrfToken}
                />
            ) */}
        </div>
    );
}

export default SourceInput;
