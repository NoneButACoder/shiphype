import crypto from "crypto";

export interface TwitterCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  bearerToken?: string;
}

export interface PostTweetResult {
  success: boolean;
  simulated?: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

/**
 * Generate OAuth 1.0a Authorization header for Twitter API requests
 */
function getOAuth1Header(
  method: string,
  url: string,
  credentials: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  },
  extraParams: Record<string, string> = {}
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken,
    oauth_version: "1.0",
    ...extraParams,
  };

  // Sort and encode parameters
  const sortedKeys = Object.keys(oauthParams).sort();
  const paramString = sortedKeys
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`
    )
    .join("&");

  // Create signature base string
  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url.split("?")[0]),
    encodeURIComponent(paramString),
  ].join("&");

  // Signing key is consumer_secret&token_secret
  const signingKey = `${encodeURIComponent(credentials.apiSecret)}&${encodeURIComponent(
    credentials.accessTokenSecret
  )}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .filter((k) => k.startsWith("oauth_"))
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`);

  return `OAuth ${headerParts.join(", ")}`;
}

/**
 * Upload an image buffer to Twitter v1.1 media upload endpoint
 */
export async function uploadMediaToTwitter(
  imageBuffer: Buffer,
  credentials: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }
): Promise<{ mediaId?: string; error?: string }> {
  try {
    const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
    const base64Data = imageBuffer.toString("base64");

    const authHeader = getOAuth1Header("POST", uploadUrl, credentials);

    const formData = new URLSearchParams();
    formData.append("media_data", base64Data);

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await res.json();
    if (!res.ok || !data.media_id_string) {
      return {
        error:
          data.errors?.[0]?.message ||
          data.error ||
          `Media upload failed with status ${res.status}`,
      };
    }

    return { mediaId: data.media_id_string };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Media upload exception",
    };
  }
}

/**
 * Post a tweet using Twitter API v2
 */
export async function postTweetToTwitter(
  text: string,
  mediaIds: string[] = [],
  credentials: TwitterCredentials
): Promise<PostTweetResult> {
  const hasOAuth1 =
    credentials.apiKey &&
    credentials.apiSecret &&
    credentials.accessToken &&
    credentials.accessTokenSecret;

  const hasBearer = !!credentials.bearerToken;

  if (!hasOAuth1 && !hasBearer) {
    return {
      success: false,
      error:
        "No Twitter/X API credentials provided. Please supply API Key/Secret + Access Token or Bearer Token.",
    };
  }

  try {
    const tweetUrl = "https://api.twitter.com/2/tweets";
    const bodyPayload: { text: string; media?: { media_ids: string[] } } = {
      text,
    };

    if (mediaIds.length > 0) {
      bodyPayload.media = { media_ids: mediaIds };
    }

    let authHeader: string;
    if (hasOAuth1) {
      authHeader = getOAuth1Header("POST", tweetUrl, {
        apiKey: credentials.apiKey!,
        apiSecret: credentials.apiSecret!,
        accessToken: credentials.accessToken!,
        accessTokenSecret: credentials.accessTokenSecret!,
      });
    } else {
      authHeader = `Bearer ${credentials.bearerToken}`;
    }

    const res = await fetch(tweetUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await res.json();

    if (!res.ok || !data.data?.id) {
      return {
        success: false,
        error:
          data.detail ||
          data.errors?.[0]?.message ||
          data.title ||
          `Posting to X failed (HTTP ${res.status})`,
      };
    }

    const tweetId = data.data.id;
    return {
      success: true,
      tweetId,
      tweetUrl: `https://x.com/i/web/status/${tweetId}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Tweet posting exception",
    };
  }
}
