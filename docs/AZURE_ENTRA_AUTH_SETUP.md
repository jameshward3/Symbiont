# Microsoft Entra ID access setup

The Command Center uses Microsoft Entra ID (formerly Azure AD) through a single-tenant OpenID Connect application. The application keeps an eight-hour encrypted, server-side-validated browser session. It uses the immutable Entra tenant ID and user object ID for authorization; email is display-only.

## Register the application

1. In the Microsoft Entra admin center, open **App registrations** and create **Symbiont Command Center**.
2. Choose **Accounts in this organizational directory only (single tenant)**.
3. Under **Authentication**, add these **Web** redirect URIs:
   - `https://symbiont-three.vercel.app/api/auth/callback/microsoft-entra-id`
   - `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - The equivalent `/api/auth/callback/microsoft-entra-id` URI for every custom or Sites production domain that will serve the Command Center.
4. Under **Certificates & secrets**, create a client secret and copy its **Value** immediately. Do not commit it or add it to a client-side variable.
5. In **Enterprise applications** for this registration, set **Assignment required?** to **Yes**, then assign only the Symbiont users or groups that should sign in. This is the primary access roster.

The requested scope is deliberately limited to `openid profile email`; the app does not request Microsoft Graph access or use email as an authorization key.

## Configure each deployment

Generate `AUTH_SECRET` with a cryptographically secure 32-byte value, for example:

```sh
openssl rand -base64 32
```

Add the following server-only environment variables to Vercel and to any other Command Center host. The values are documented in [`.env.example`](../apps/command-center/.env.example).

```dotenv
AUTH_SECRET=<generated-secret>
AUTH_TRUST_HOST=true
AUTH_MICROSOFT_ENTRA_ID_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<client-secret-value>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0
# Optional defense in depth: comma-separated Entra user object IDs.
AUTH_MICROSOFT_ENTRA_ID_ALLOWED_OBJECT_IDS=
```

`AUTH_MICROSOFT_ENTRA_ID_ALLOWED_OBJECT_IDS` is optional. When it is empty, Entra enterprise-app assignment controls access. When it is populated, a user must be both assigned in Entra and listed by immutable Entra object ID.

Remove the retired `SITE_USERNAME` and `SITE_PASSWORD` deployment variables after Entra sign-in has been validated.

## Verify

1. Visit the deployment while signed out and confirm that it redirects to `/signin`.
2. Sign in with an assigned user and confirm that the Command Center and its protected API routes load.
3. Confirm that an unassigned tenant user is rejected by Entra, and that a user from another tenant cannot start a session.
4. Check `/api/health/ready`; it reports `microsoftEntra: true` only when all required server-side configuration is present.

Microsoft requires an exact registered redirect URI, and the Auth.js callback for this provider is `/api/auth/callback/microsoft-entra-id`. See the [Auth.js Microsoft Entra provider guide](https://authjs.dev/getting-started/providers/microsoft-entra-id) and Microsoft’s [app registration guidance](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).
