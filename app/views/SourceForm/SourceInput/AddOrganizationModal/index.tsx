import React, { useCallback } from 'react';
import {
    useForm,
    requiredCondition,
    urlCondition,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    PendingMessage,
    SelectInput,
    TextInput,
    Button,
    Modal,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useRequest,
    useLazyRequest,
} from '#base/utils/restRequest';

import {
    Organization,
    OrganizationType,
} from '#types/organization';
import {
    MultiResponse,
} from '#types/common';

import styles from './styles.css';

type FormType = Partial<Pick<Organization, 'title' | 'shortName' | 'url' | 'organizationType' | 'logo'>>
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const organizationSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        shortName: [requiredStringCondition],
        url: [urlCondition],
        organizationType: [requiredCondition],
        logo: [], // FIXME use DeepImageInput when available
    }),
};

const organizationTypeKeySelector = (d: OrganizationType): number => d.id;
const organizationTypeLabelSelector = (d: OrganizationType): string => d.title;

const defaultFormValue: FormType = {};

export interface Props {
    onModalClose: () => void;
    onOrganizationAdd?: (organization: Organization) => void;
}

function AddOrganizationModal(props: Props) {
    const {
        onModalClose,
        onOrganizationAdd,
    } = props;

    const alert = useAlert();

    const {
        pending: organizationTypesPending,
        response: organizatonTypesResponse,
    } = useRequest<MultiResponse<OrganizationType>>({
        url: 'server://organization-types/',
        method: 'GET',
        failureHeader: 'addOrganizationModal',
    });
    const {
        pending: organizationPostPending,
        trigger: createOrganization,
    } = useLazyRequest<Organization, FormType>({
        url: 'server://organizations/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onOrganizationAdd) {
                onOrganizationAdd(response);
                alert.show(
                    'Organization created successfully!',
                    { variant: 'success' },
                );
            }
            onModalClose();
        },
        onFailure: ({ value: errorValue }) => {
            alert.show(
                { children: errorValue },
                { variant: 'error' },
            );
        },
        failureHeader: 'addOrganizationModal',
    });

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(organizationSchema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                createOrganization,
            );
            submit();
        },
        [setError, validate, createOrganization],
    );
    const pending = organizationTypesPending || organizationPostPending;

    return (
        <Modal
            className={styles.addOrganizationModal}
            heading="Add Organization"
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    type="submit"
                    variant="primary"
                    disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {pending && <PendingMessage />}
            <TextInput
                name="title"
                disabled={pending}
                onChange={setFieldValue}
                value={value?.title}
                error={error?.title}
                label="Title"
                autoFocus
            />
            <TextInput
                name="shortName"
                disabled={pending}
                onChange={setFieldValue}
                value={value?.shortName}
                error={error?.shortName}
                label="Short name"
            />
            <TextInput
                name="url"
                disabled={pending}
                onChange={setFieldValue}
                value={value?.url}
                error={error?.url}
                label="URL"
            />
            <SelectInput
                name="organizationType"
                onChange={setFieldValue}
                options={organizatonTypesResponse?.results}
                value={value?.organizationType}
                error={error?.organizationType}
                keySelector={organizationTypeKeySelector}
                labelSelector={organizationTypeLabelSelector}
                label="Organization Type"
            />
        </Modal>
    );
}
export default AddOrganizationModal;
