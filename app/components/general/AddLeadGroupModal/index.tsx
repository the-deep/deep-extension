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
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import { useLazyRequest } from '#base/utils/restRequest';
import { LeadGroup } from '../../../types/lead';

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
    // FIXME: Replace with graphql mutation
    onLeadGroupAdd?: (leadGroup: { id: string; title: string }) => void;
}

function AddLeadGroupModal(props: Props) {
    const {
        onModalClose,
        onLeadGroupAdd,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? +project.id : undefined;

    const {
        trigger: leadGroupAddTrigger,
        pending: leadGroupAddPending,
    } = useLazyRequest<LeadGroup, FormType>({
        url: 'server://lead-groups/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onLeadGroupAdd) {
                onLeadGroupAdd({
                    id: String(response.id),
                    title: response.title,
                });
            }
            onModalClose();
        },
        failureHeader: 'Title',
    });

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
    } = useForm(leadGroupSchema, defaultFormValue);

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
            heading="addLeadGroupHeading"
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
            {leadGroupAddPending && <PendingMessage />}
            <TextInput
                name="title"
                value={value?.title}
                error={error?.title}
                onChange={setFieldValue}
                label="titleLabel"
                placeholder="titlePlaceholder"
            />
        </Modal>
    );
}

export default AddLeadGroupModal;
