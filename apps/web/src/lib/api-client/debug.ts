/**
 * Comprehensive debugging system for SSR API requests.
 * Enabled when NODE_ENV=development or NEXT_PUBLIC_DEBUG_API=true.
 */

interface DebugRequestInfo {
  timestamp: string;
  environment: 'server' | 'client';
  url: string;
  fullUrl: string;
  method: string;
  headers: Record<string, string>;
  body?: string | object;
  queryParams?: Record<string, string | string[]>;
}

interface DebugResponseInfo {
  timestamp: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: unknown;
  duration: number;
}

const formatHeaders = (headers: Headers): Record<string, string> => {
  const headerObj: Record<string, string> = {};
  headers.forEach((value, key) => {
    headerObj[key] = value;
  });
  return headerObj;
};

const extractQueryParams = (url: string): Record<string, string | string[]> | undefined => {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string | string[]> = {};
    urlObj.searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
    return Object.keys(params).length > 0 ? params : undefined;
  } catch {
    return undefined;
  }
};

const parseRequestBody = (body?: BodyInit | null): string | object | undefined => {
  if (!body) return undefined;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return '[Binary/FormData/Complex Body]';
};

export const logRequest = (url: string, fullUrl: string, options: RequestInit): DebugRequestInfo => {
  const debugInfo: DebugRequestInfo = {
    timestamp: new Date().toISOString(),
    environment: typeof window === 'undefined' ? 'server' : 'client',
    url,
    fullUrl,
    method: options.method || 'GET',
    headers: options.headers ? formatHeaders(options.headers as Headers) : {},
    body: parseRequestBody(options.body),
    queryParams: extractQueryParams(fullUrl),
  };

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    API REQUEST DEBUG                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\u{1F552} Timestamp:    ${debugInfo.timestamp}`);
  console.log(`\u{1F30D} Environment:  ${debugInfo.environment.toUpperCase()}`);
  console.log(`\u{1F4CD} Method:       ${debugInfo.method}`);
  console.log(`\u{1F517} Original URL: ${debugInfo.url}`);
  console.log(`\u{1F517} Full URL:     ${debugInfo.fullUrl}`);
  if (debugInfo.queryParams) {
    console.log('\n\u{1F4CB} Query Parameters:');
    console.log(JSON.stringify(debugInfo.queryParams, null, 2));
  }
  console.log('\n\u{1F4E8} Request Headers:');
  console.log(JSON.stringify(debugInfo.headers, null, 2));
  if (debugInfo.body) {
    console.log('\n\u{1F4E6} Request Body:');
    console.log(typeof debugInfo.body === 'object' ? JSON.stringify(debugInfo.body, null, 2) : debugInfo.body);
  }
  console.log('─────────────────────────────────────────────────────────────\n');

  return debugInfo;
};

export const logResponse = async (response: Response, startTime: number): Promise<DebugResponseInfo> => {
  const duration = Date.now() - startTime;
  const clonedResponse = response.clone();
  let responseBody: unknown;
  try {
    const text = await clonedResponse.text();
    responseBody = text ? JSON.parse(text) : null;
  } catch {
    responseBody = '[Could not parse response body]';
  }

  const debugInfo: DebugResponseInfo = {
    timestamp: new Date().toISOString(),
    status: response.status,
    statusText: response.statusText,
    headers: formatHeaders(response.headers),
    body: responseBody,
    duration,
  };

  const statusEmoji = response.ok ? '✅' : '❌';
  const statusColor = response.ok ? '' : '🔴 ';

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   API RESPONSE DEBUG                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\u{1F552} Timestamp:    ${debugInfo.timestamp}`);
  console.log(`${statusEmoji} Status:       ${statusColor}${debugInfo.status} ${debugInfo.statusText}`);
  console.log(`\u{23F1}️  Duration:     ${debugInfo.duration}ms`);
  console.log('\n\u{1F4EB} Response Headers:');
  console.log(JSON.stringify(debugInfo.headers, null, 2));
  if (debugInfo.body) {
    console.log('\n\u{1F4E6} Response Body:');
    console.log(typeof debugInfo.body === 'object' ? JSON.stringify(debugInfo.body, null, 2) : debugInfo.body);
  }
  console.log('═════════════════════════════════════════════════════════════\n\n');

  return debugInfo;
};

export const logError = (error: unknown, url: string, startTime: number): void => {
  const duration = Date.now() - startTime;

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     API ERROR DEBUG                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\u{1F552} Timestamp:    ${new Date().toISOString()}`);
  console.log(`❌ Error:        ${error instanceof Error ? error.message : String(error)}`);
  console.log(`\u{1F517} URL:          ${url}`);
  console.log(`\u{23F1}️  Duration:     ${duration}ms`);
  if (error instanceof Error && error.stack) {
    console.log('\n\u{1F4DA} Stack Trace:');
    console.log(error.stack);
  }
  console.log('═════════════════════════════════════════════════════════════\n\n');
};

export const isDebugEnabled = (): boolean =>
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_API === 'true';
