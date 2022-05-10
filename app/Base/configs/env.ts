export const isProduction = process.env.REACT_APP_ENVIRONMENT === 'production';
export const isStaging = process.env.REACT_APP_ENVIRONMENT === 'staging';
export const isDev = !isProduction && !isStaging;
