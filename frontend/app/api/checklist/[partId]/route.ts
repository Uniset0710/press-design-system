import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'http://localhost:3002';

function cloneHeaders(request: NextRequest) {
  const headers = new Headers();
  const auth = request.headers.get('authorization');
  const cookie = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');
  if (auth) headers.set('authorization', auth);
  if (cookie) headers.set('cookie', cookie);
  if (contentType) headers.set('content-type', contentType);
  return headers;
}

async function proxy(request: NextRequest, method: string, url: string) {
  const headers = cloneHeaders(request);
  const backendRes = await fetch(url, {
    method,
    headers,
    body: request.body,
    credentials: 'include',
  });
  if (backendRes.status === 401) {
    return NextResponse.json({ error: 'unauth' }, { status: 401 });
  }
  const contentType = backendRes.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status, headers: backendRes.headers });
  } else {
    const blob = await backendRes.blob();
    return new NextResponse(blob, { status: backendRes.status, headers: backendRes.headers });
  }
}

export async function GET(request: NextRequest, { params }: { params: { partId: string } }) {
  return proxy(request, 'GET', `${BACKEND}/api/checklist/${params.partId}`);
}

export async function POST(request: NextRequest, { params }: { params: { partId: string } }) {
  const body = await request.json();
  const headers = cloneHeaders(request);
  headers.set('content-type', 'application/json');
  const backendRes = await fetch(`${BACKEND}/api/checklist/${params.partId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const contentType = backendRes.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status, headers: backendRes.headers });
  } else {
    const blob = await backendRes.blob();
    return new NextResponse(blob, { status: backendRes.status, headers: backendRes.headers });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { partId: string } }) {
  const body = await request.json();
  const headers = cloneHeaders(request);
  headers.set('content-type', 'application/json');
  const backendRes = await fetch(`${BACKEND}/api/checklist/${params.partId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const contentType = backendRes.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status, headers: backendRes.headers });
  } else {
    const blob = await backendRes.blob();
    return new NextResponse(blob, { status: backendRes.status, headers: backendRes.headers });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { partId: string } }) {
  return proxy(request, 'DELETE', `${BACKEND}/api/checklist/${params.partId}`);
} 