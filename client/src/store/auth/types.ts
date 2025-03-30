export interface User {
  // username: string;
  name: string;
  email: string;
  // token: string;
}

export interface AuthState {
  user: User | null;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

// const d = {
//   oauth_state: None,
//   _state_google_lgYNEofoaRnwAY0r3VLcMOXrBZHdvK: {
//     data: {
//       redirect_uri: "http://localhost:8000/auth/google/callback",
//       nonce: "HW42gbbgBldJ29rRuaGR",
//       url: "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=564727465848-lfgrau28p1p9mp1tf0umv73ua9r9behi.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth%2Fgoogle%2Fcallback&scope=openid+email+profile&state=lgYNEofoaRnwAY0r3VLcMOXrBZHdvK&nonce=HW42gbbgBldJ29rRuaGR",
//     },
//     exp: 1743330718.1037557,
//   },
// };
