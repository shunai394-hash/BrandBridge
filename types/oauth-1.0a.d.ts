declare module "oauth-1.0a" {
  type OAuthRequest = {
    url: string;
    method: string;
    data?: Record<string, string>;
  };

  type OAuthToken = {
    key: string;
    secret: string;
  };

  export default class OAuth {
    constructor(options: {
      consumer: { key: string; secret: string };
      signature_method: string;
      hash_function: (baseString: string, key: string) => string;
    });
    authorize(request: OAuthRequest, token: OAuthToken): Record<string, string>;
    toHeader(authorized: Record<string, string>): { Authorization: string };
  }
}
