let isLoggedIn = false;

export const Auth = {
  login() {
    isLoggedIn = true;
  },
  logout() {
    isLoggedIn = false;
  },
  getStatus() {
    return isLoggedIn;
  },
};