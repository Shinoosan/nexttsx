// src/app/api/check-proxy/route.ts
import { NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

export async function POST(request: Request) {
  try {
    const { proxy } = await request.json();
    const [host, port, user, pass] = proxy.split(':');
    const proxyUrl = `http://${user}:${pass}@${host}:${port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    const response = await fetch('https://api.ipify.org?format=json', {
      agent,
      timeout: 5000,
    });

    const isLive = response.ok;
    return NextResponse.json({ isLive });
  } catch (error) {
    return NextResponse.json({ isLive: false });
  }
}