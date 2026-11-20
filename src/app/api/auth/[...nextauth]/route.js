import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      id: "google",
      name: "Google",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account"
        }
      }
    }),
    GoogleProvider({
      id: "google-calendar",
      name: "Google Calendar",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Email y Contraseña",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "ejecutivo@empresa.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          const sdrBackend = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
          const baseUrl = sdrBackend.endsWith('/api') ? sdrBackend : `${sdrBackend}/api`
          const res = await fetch(`${baseUrl}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              provider: 'Credentials'
            })
          });
          const response = await res.json();
          if (res.ok && response.status === 'success' && response.data) {
            return {
              id: response.data.ID,
              name: response.data.Name,
              email: response.data.Email,
              role: response.data.Role,
              companyId: response.data.CompanyID,
              companyConfirmed: Boolean(response.data.company_confirmed ?? response.data.CompanyConfirmed)
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account) {
        token.provider = account.provider;
        if (account.provider === 'google' || account.provider === 'google-calendar') {
          token.isGoogleAuth = true;
          token.accessToken = account.access_token;
          if (account.refresh_token) {
            token.refreshToken = account.refresh_token;
          }
          // Solo vincular Calendar si el proveedor fue google-calendar o incluye el scope de calendar explícito
          if (account.provider === 'google-calendar' || account.scope?.includes('calendar')) {
            token.calendarConnected = true;
          }
        } else {
          token.isGoogleAuth = false;
        }
      }
      if (profile) {
        token.givenName = profile.given_name || token.givenName || '';
        token.familyName = profile.family_name || token.familyName || '';
        token.picture = profile.picture || token.picture;
        token.locale = profile.locale || token.locale;
      }
      if (user) {
        token.name = user.name || token.name;
        token.picture = user.image || token.picture;
        token.role = user.role || 'ADMIN';
        token.companyId = user.companyId || '';
        token.companyConfirmed = Boolean(user.companyConfirmed);
      }
      if (!token.givenName && token.name) {
        const parts = token.name.trim().split(/\s+/);
        token.givenName = parts[0] || '';
        token.familyName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name || session.user.name;
        session.user.image = token.picture || session.user.image;
        session.user.givenName = token.givenName || '';
        session.user.familyName = token.familyName || '';
        session.user.locale = token.locale || '';
        session.user.role = token.role;
        session.user.companyId = token.companyId;
        session.user.provider = token.provider || 'email';
        session.user.isGoogleAuth = Boolean(token.isGoogleAuth);
        session.user.calendarConnected = Boolean(token.calendarConnected);
        session.user.companyConfirmed = Boolean(token.companyConfirmed);
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'google-calendar') {
        try {
          const sdrBackend = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
          const baseUrl = sdrBackend.endsWith('/api') ? sdrBackend : `${sdrBackend}/api`
          const hasCalendarScope = account.provider === 'google-calendar' || Boolean(account.scope?.includes('calendar'))
          const res = await fetch(`${baseUrl}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: 'Google',
              // Solo enviamos tokens a la base de datos si el usuario autorizó Google Calendar expresamente
              access_token: hasCalendarScope ? (account.access_token || '') : '',
              refresh_token: hasCalendarScope ? (account.refresh_token || '') : ''
            }),
          })
          const response = await res.json();
          if (response && response.data) {
            user.role = response.data.Role || response.data.role || 'ADMIN';
            user.companyId = response.data.CompanyID || response.data.company_id || '';
            user.companyConfirmed = Boolean(response.data.company_confirmed ?? response.data.CompanyConfirmed);
          }
        } catch (error) {
          console.error("Error sincronizando usuario:", error)
        }
      }
      return true
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
