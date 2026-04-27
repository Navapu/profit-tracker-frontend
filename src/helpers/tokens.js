export const setTokens = (token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken)
};

export const getAccessToken = () => {
    return localStorage.getItem('token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};
export const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};