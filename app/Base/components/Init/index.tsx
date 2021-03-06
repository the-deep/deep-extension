import React, { useContext, useState, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { UserContext } from '#base/context/UserContext';
import PreloadMessage from '#base/components/PreloadMessage';
import {
    ProjectContext,
    ProjectContextInterface,
} from '#base/context/ProjectContext';
import { Project } from '#base/types/project';
import { MeQuery, MeQueryVariables } from '#generated/types';

const ME = gql`
    query Me {
        me {
            firstName
            lastName
            id
            email
            displayName
            lastActiveProject {
                id
                title
                allowedPermissions
            }
        }
    }
`;

interface Props {
    className?: string;
    children: React.ReactNode;
}
function Init(props: Props) {
    const {
        className,
        children,
    } = props;

    const [ready, setReady] = useState(false);
    const [project, setProject] = useState<Project | undefined>(undefined);

    const {
        setUser,
    } = useContext(UserContext);

    useQuery<MeQuery, MeQueryVariables>(ME, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            const safeMe = removeNull(data.me);
            if (safeMe) {
                setUser(safeMe);
                setProject(safeMe?.lastActiveProject ?? undefined);
            } else {
                setUser(undefined);
                setProject(undefined);
            }
            setReady(true);
        },
        onError: () => {
            /*
            FIXME: why comment this out? is this handled later on?
            const { graphQLErrors } = error;
            const authError = checkErrorCode(
                graphQLErrors,
                ['me'],
                '401',
            );
            setErrored(!authError);
            */
            setReady(true);
        },
    });

    const projectContext: ProjectContextInterface = useMemo(
        () => ({
            project,
            setProject,
        }),
        [project],
    );

    if (!ready) {
        return (
            <PreloadMessage
                className={className}
                content="Checking user session..."
            />
        );
    }

    return (
        <ProjectContext.Provider value={projectContext}>
            {children}
        </ProjectContext.Provider>
    );
}
export default Init;
