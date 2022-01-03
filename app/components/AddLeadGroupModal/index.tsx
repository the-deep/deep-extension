import React, { useCallback, useMemo } from 'react';
import {
    useForm,
    requiredCondition,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextInput,
    Button,
    PendingMessage,
    useAlert,
} from '@the-deep/deep-ui';

import {
    useLazyRequest,
    useRequest,
} from '#base/utils/restRequest';

export interface LeadGroup {
    id: number;
    createdAt: string;
    modifiedAt: string;
    createdBy: number;
    modifiedBy: number;
    createdByName: string;
    modifiedByName: string;
    clientId?: string;
    versionId: number;
    noOfLeads?: number;
    title: string;
    project?: number;
}

type FormType = Partial<Pick<LeadGroup, 'title' | 'project'>>
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const leadGroupSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        project: [requiredCondition],
    }),
};

export interface Props {
    onModalClose: () => void;
    leadGroupToEdit?: string;
    activeProject: number;
    csrfToken: string | undefined;
    // FIXME: Replace with graphql mutation
    onLeadGroupAdd?: (leadGroup: { id: string; title: string }) => void;
}

function AddLeadGroupModal(props: Props) {
    const {
        onModalClose,
        leadGroupToEdit,
        activeProject,
        onLeadGroupAdd,
        csrfToken,
    } = props;

    const alert = useAlert();

    const defaultFormValue: FormType = useMemo(() => ({
        project: activeProject,
    }), [activeProject]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(leadGroupSchema, defaultFormValue);

    const {
        pending: leadGroupFetchPending,
    } = useRequest<LeadGroup>({
        skip: !leadGroupToEdit,
        url: `server://lead-groups/${leadGroupToEdit}/`,
        method: 'GET',
        onSuccess: (response) => {
            setValue({
                ...value,
                title: response?.title,
            });
        },
    });

    const {
        trigger: leadGroupAddTrigger,
        pending: leadGroupAddPending,
    } = useLazyRequest<LeadGroup, FormType>({
        url: leadGroupToEdit ? `server://lead-groups/${leadGroupToEdit}/` : 'server://lead-groups/',
        method: leadGroupToEdit ? 'PATCH' : 'POST',
        body: (ctx) => ctx,
        other: () => ({
            headers: {
                Authorization: `Bearer ${csrfToken}`,
            },
        }),
        onSuccess: (response) => {
            if (onLeadGroupAdd) {
                onLeadGroupAdd({
                    id: String(response.id),
                    title: response.title,
                });
            }
            alert.show(
                leadGroupToEdit
                    ? 'Successfully updated source group.'
                    : 'Successfully added source group.',
                {
                    variant: 'success',
                },
            );
            onModalClose();
        },
        onFailure: ({ value: errorValue }) => {
            alert.show(
                { children: errorValue },
                { variant: 'error' },
            );
            onModalClose();
        },
    });

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                leadGroupAddTrigger,
            );
            submit();
        },
        [setError, validate, leadGroupAddTrigger],
    );

    return (
        <Modal
            heading="Add lead group"
            freeHeight
            size="small"
            onCloseButtonClick={onModalClose}
            footerActions={(
                <Button
                    name="submit"
                    type="submit"
                    variant="primary"
                    disabled={pristine || leadGroupAddPending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {(leadGroupFetchPending || leadGroupAddPending) && <PendingMessage />}
            <TextInput
                name="title"
                value={value?.title}
                error={error?.title}
                onChange={setFieldValue}
                label="Title"
            />
        </Modal>
    );
}

export default AddLeadGroupModal;
