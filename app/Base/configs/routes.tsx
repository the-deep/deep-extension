import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: false,
    component: lazy(() => import('#views/Login')),
    componentProps: {},
    visibility: 'is-not-authenticated',
});
const index = wrap({
    // NOTE: the first url is /index.html for addons
    path: '/index.html',
    title: 'Index',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const home = wrap({
    path: '/',
    title: 'Add source',
    component: lazy(() => import('#views/SourceForm')),
    componentProps: {},
    visibility: 'is-authenticated',
    navbarVisibility: true,
});

const leadSettings = wrap({
    path: '/lead-settings/',
    title: 'Settings',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceSettings')),
    componentProps: {},
    visibility: 'is-anything',
});

const settingsSuccessForm = wrap({
    path: '/lead-settings-sucess/',
    title: 'Settings Saved',
    navbarVisibility: true,
    component: lazy(() => import('#views/SettingsSuccess')),
    componentProps: {},
    visibility: 'is-anything',
});

const fourHundredFour = wrap({
    path: '',
    title: '404',
    component: lazy(() => import('#views/FourHundredFour')),
    componentProps: {},
    visibility: 'is-anything',
    navbarVisibility: true,
});

const routes = {
    login,
    index,
    home,
    leadSettings,
    fourHundredFour,
    settingsSuccessForm,
};
export default routes;
