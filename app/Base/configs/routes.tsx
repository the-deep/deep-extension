import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const fourHundredFour = wrap({
    path: '#',
    title: '404',
    component: lazy(() => import('#views/FourHundredFour')),
    componentProps: {
        className: undefined,
    },
    visibility: 'is-anything',
    navbarVisibility: true,
});

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
const home = wrap({
    // NOTE: the first url is /index.html for addons
    path: '/',
    title: 'Home',
    navbarVisibility: true,
    component: lazy(() => import('#views/LeadModal')),
    componentProps: {
        projectId: '',
    },
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
    path: '/success',
    title: 'Success Submission',
    navbarVisibility: true,
    component: lazy(() => import('#views/SuccessForm')),
    componentProps: {
        className: undefined,
    },
    visibility: 'is-authenticated',
});

const failureForm = wrap({
    path: '/failure',
    title: 'Failure Submission',
    navbarVisibility: true,
    component: lazy(() => import('#views/FailureForm')),
    componentProps: {
        className: undefined,
    },
    visibility: 'is-authenticated',
});

const routes = {
    login,
    home,
    myProfile,
    fourHundredFour,
    successForm,
    failureForm,
};
export default routes;
