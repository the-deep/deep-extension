import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: true,
    component: lazy(() => import('#views/Template')),
    componentProps: {
        name: 'Login to continue',
    },
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
    path: '/leadSettings/',
    title: 'Settings',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceSettings')),
    componentProps: {},
    visibility: 'is-anything',
});
const myProfile = wrap({
    path: '/my-profile/',
    title: 'My Profile',
    navbarVisibility: true,
    component: lazy(() => import('#views/Template')),
    componentProps: {
        name: 'My Profile Page',
    },
    visibility: 'is-authenticated',
});

const successForm = wrap({
    path: '/success/',
    title: 'Success Submission',
    navbarVisibility: true,
    component: lazy(() => import('#views/SuccessForm')),
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
    myProfile,
    fourHundredFour,
    successForm,
};
export default routes;
