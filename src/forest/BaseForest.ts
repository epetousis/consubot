import fetch from 'node-fetch';

/** Base Forest API thing. idk cunt */
export default class BaseForest {
  protected token: string;

  constructor(token: string) {
    this.token = token;
  }

  protected async fetch(endpoint: string, body: Record<string, unknown> | null, method: string = 'post') {
    const request = await fetch(
      `https://c88fef96.forestapp.cc/api/v1${endpoint}`,
      {
        method,
        headers: {
          'content-type': 'application/json',
          cookie: `remember_token=${this.token}`,
          'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );

    return request;
  }
}
