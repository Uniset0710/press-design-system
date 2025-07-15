import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    
    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId 파라미터가 필요합니다' },
        { status: 400 }
      );
    }
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    
    const backendUrl = `${BACKEND}/api/checklist?modelId=${modelId}`;
    const response = await fetch(backendUrl, {
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from backend');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching checklist data:', error);
    return NextResponse.json(
      { error: '체크리스트 데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    // modelId가 body에 포함되어 있는지 확인
    if (!body.modelId) {
      return NextResponse.json(
        { error: 'modelId가 필요합니다' },
        { status: 400 }
      );
    }
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    
    const backendRes = await fetch(`${BACKEND}/api/checklist`, {
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
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json(
      { error: '체크리스트 항목 생성에 실패했습니다' },
      { status: 500 }
    );
  }
} 