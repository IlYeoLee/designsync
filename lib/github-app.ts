/**
 * GitHub App authentication utilities.
 *
 * Flow:
 * 1. User clicks "Install" → redirected to GitHub App installation page
 * 2. User selects repos → GitHub redirects back with installation_id
 * 3. We store installation_id in design_systems
 * 4. On save, we generate JWT → get installation token → create PR
 */

import * as crypto from "crypto";

function getAppConfig() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const appSlug = process.env.GITHUB_APP_SLUG || "designsync";

  if (!appId || !privateKey) {
    throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set");
  }

  return { appId, privateKey, appSlug };
}

/**
 * Generate a JWT for GitHub App authentication.
 * Valid for 10 minutes (GitHub max).
 */
export function generateAppJWT(): string {
  const { appId, privateKey } = getAppConfig();

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // issued 60 sec ago (clock drift)
    exp: now + 600, // expires in 10 min
    iss: appId,
  };

  // JWT header
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${body}`)
    .sign(privateKey, "base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Get an installation access token for a specific installation.
 * This token can access the repos the user granted access to.
 */
export async function getInstallationToken(installationId: number): Promise<string> {
  const jwt = generateAppJWT();

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to get installation token: ${res.status} ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.token;
}

/**
 * List repos accessible by an installation.
 */
export async function getInstallationRepos(
  installationId: number
): Promise<{ full_name: string; default_branch: string }[]> {
  const token = await getInstallationToken(installationId);

  const res = await fetch("https://api.github.com/installation/repositories?per_page=100", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.repositories || []).map((r: { full_name: string; default_branch: string }) => ({
    full_name: r.full_name,
    default_branch: r.default_branch,
  }));
}

/**
 * Get the GitHub App installation URL for new users.
 */
export function getInstallUrl(): string {
  const { appSlug } = getAppConfig();
  return `https://github.com/apps/${appSlug}/installations/new`;
}
