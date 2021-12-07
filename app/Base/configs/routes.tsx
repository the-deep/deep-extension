import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: false,
    component: lazy(() => import('#views/Template')),
    componentProps: {
        name: 'Login Page',
    },
    visibility: 'is-not-authenticated',
});
const index = wrap({
    // NOTE: the first url is /index.html for addons
    path: '/index.html',
    title: 'index',
    navbarVisibility: true,
    component: lazy(() => import('#views/LeadForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const home = wrap({
    path: '/',
    title: 'home',
    navbarVisibility: true,
    component: lazy(() => import('#views/LeadForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const leadSettings = wrap({
    path: '/leadSettings/',
    title: 'LeadSettings',
    navbarVisibility: true,
    component: lazy(() => import('#views/LeadSettings')),
    componentProps: {},
    visibility: 'is-authenticated',
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
    visibility: 'is-authenticated',
});

const failureForm = wrap({
    path: '/failure/',
    title: 'Failure Submission',
    navbarVisibility: true,
    component: lazy(() => import('#views/FailureForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const fourHundredFour = wrap({
    path: '',
    title: '404',
    component: lazy(() => import('#views/FourHundredFour')),
    componentProps: {},
    visibility: 'is-authenticated',
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
    failureForm,
};
export default routes;
