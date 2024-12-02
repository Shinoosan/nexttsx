import { NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

interface IpifyResponse {
  ip: string;
}

interface CustomError extends Error {
  name: string;
}

export async function POST(request: Request) {
  try {
    const { proxy } = await request.json();
    const [host, port, user, pass] = proxy.split(':');
    const proxyUrl = `http://${user}:${pass}@${host}:${port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000); // Timeout after 5 seconds

    const response = await fetch('https://api.ipify.org?format=json', {
      agent,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const isLive = response.ok;
    const data = await response.json();
    const typedData: IpifyResponse = data as IpifyResponse;

    return NextResponse.json({ isLive, ip: typedData.ip });
  } catch (error: unknown) {
    const customError = error as CustomError;
    if (customError.name === 'AbortError') {
      return NextResponse.json({ isLive: false, error: 'Proxy timed out' }, { status: 408 });
    }
    return NextResponse.json({ isLive: false, error: 'Error checking proxy' }, { status: 500 });
  }
}
