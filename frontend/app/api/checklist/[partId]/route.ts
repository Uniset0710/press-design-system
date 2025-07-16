import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logChecklistAction } from '@/utils/audit';

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
    
    const url = `${BACKEND}/api/checklist/${params.partId}?modelId=${modelId}`;
    const result = await proxy(request, 'GET', url);
    
    // 감사 로그 기록
    if (session?.user) {
      const user = session.user as any;
      logChecklistAction(
        'checklist.view',
        params.partId,
        user.id || 'unknown',
        user.name || 'unknown',
        { modelId },
        result.status < 400,
        result.status >= 400 ? 'Failed to fetch checklist' : undefined
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching checklist item:', error);
    return NextResponse.json(
      { error: '체크리스트 항목 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { partId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    if (!body.modelId) {
      return NextResponse.json(
        { error: 'modelId가 필요합니다' },
        { status: 400 }
      );
    }
    
    const headers = cloneHeaders(request);
    headers.set('content-type', 'application/json');
    const backendRes = await fetch(`${BACKEND}/api/checklist/${params.partId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    
    const contentType = backendRes.headers.get('content-type') || '';
    let result;
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      result = NextResponse.json(data, { status: backendRes.status, headers: backendRes.headers });
    } else {
      const blob = await backendRes.blob();
      result = new NextResponse(blob, { status: backendRes.status, headers: backendRes.headers });
    }
    
    // 감사 로그 기록
    if (session?.user) {
      const user = session.user as any;
      logChecklistAction(
        'checklist.create',
        params.partId,
        user.id || 'unknown',
        user.name || 'unknown',
        { modelId: body.modelId, text: body.text },
        backendRes.ok,
        !backendRes.ok ? 'Failed to create checklist item' : undefined
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json(
      { error: '체크리스트 항목 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { partId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    if (!body.modelId) {
      return NextResponse.json(
        { error: 'modelId가 필요합니다' },
        { status: 400 }
      );
    }
    
    const headers = cloneHeaders(request);
    headers.set('content-type', 'application/json');
    const backendRes = await fetch(`${BACKEND}/api/checklist/${params.partId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    
    const contentType = backendRes.headers.get('content-type') || '';
    let result;
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      result = NextResponse.json(data, { status: backendRes.status, headers: backendRes.headers });
    } else {
      const blob = await backendRes.blob();
      result = new NextResponse(blob, { status: backendRes.status, headers: backendRes.headers });
    }
    
    // 감사 로그 기록
    if (session?.user) {
      const user = session.user as any;
      logChecklistAction(
        'checklist.update',
        params.partId,
        user.id || 'unknown',
        user.name || 'unknown',
        { modelId: body.modelId, itemId: body.id },
        backendRes.ok,
        !backendRes.ok ? 'Failed to update checklist item' : undefined
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json(
      { error: '체크리스트 항목 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { partId: string } }) {
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
    
    const url = `${BACKEND}/api/checklist/${params.partId}?modelId=${modelId}`;
    const result = await proxy(request, 'DELETE', url);
    
    // 감사 로그 기록
    if (session?.user) {
      const user = session.user as any;
      logChecklistAction(
        'checklist.delete',
        params.partId,
        user.id || 'unknown',
        user.name || 'unknown',
        { modelId },
        result.status < 400,
        result.status >= 400 ? 'Failed to delete checklist item' : undefined
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json(
      { error: '체크리스트 항목 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
} 