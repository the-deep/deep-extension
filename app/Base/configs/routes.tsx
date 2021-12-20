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
    title: 'Index',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const home = wrap({
    path: '/',
    title: 'Home',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const leadSettings = wrap({
    path: '/leadSettings/',
    title: 'Source Settings',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceSettings')),
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

const fourHundredFour = wrap({
    path: '',
    title: '404',
    component: lazy(() => import('#views/FourHundredFour')),
    componentProps: {},
    visibility: 'is-anything',
    navbarVisibility: false,
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
