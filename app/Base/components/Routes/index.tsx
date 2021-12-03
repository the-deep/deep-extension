import React, { Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import PreloadMessage from '#base/components/PreloadMessage';

import routes from '#base/configs/routes';

interface Props {
    className?: string;
}

function Routes(props: Props) {
    const { className } = props;

    return (
        <Suspense
            fallback={(
                <PreloadMessage
                    className={className}
                    content="Loading page..."
                />
            )}
        >
            <Switch>
                <Route
                    exact
                    path={routes.home.path}
                >
                    {routes.home.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.homeTwo.path}
                >
                    {routes.homeTwo.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.leadSettings.path}
                >
                    {routes.leadSettings.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.myProfile.path}
                >
                    {routes.myProfile.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.login.path}
                >
                    {routes.login.load({ className })}
                </Route>
                <Route
                    exact
                    path={routes.successForm.path}
                >
                    {routes.successForm.load({ className: undefined })}
                </Route>
                <Route
                    exact
                    path={routes.failureForm.path}
                >
                    {routes.failureForm.load({ className: undefined })}
                </Route>
                <Route
                    exact
                    path={routes.fourHundredFour.path}
                >
                    {routes.fourHundredFour.load({ className: undefined })}
                </Route>
            </Switch>
        </Suspense>
    );
}
export default Routes;
