import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { auditLogger } from '@/utils/audit';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching models from:', `${API_BASE}/api/models`);
    
    // Get session and authorization header
    const session = await getServerSession(authOptions);
    const authHeader = request.headers.get('authorization');
    console.log('Session present:', !!session);
    console.log('Auth header present:', !!authHeader);
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    } else if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${API_BASE}/api/models`, {
      headers,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Models data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: `Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Creating model with data:', body);
    
    // Get session and authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Session present:', !!session);
    console.log('Auth header present:', !!authHeader);
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    } else if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${API_BASE}/api/models`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('POST response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      
      // 감사 로그 기록 (실패)
      auditLogger.log('model.create', 'model', {
        modelName: body.name,
        modelCode: body.code,
      }, {
        userId: user.id,
        username: user.name,
        success: false,
        errorMessage: errorData.error || 'Failed to create model',
        severity: 'medium',
      });
      
      return NextResponse.json(
        { error: errorData.error || 'Failed to create model' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Created model:', data);
    
    // 감사 로그 기록 (성공)
    auditLogger.log('model.create', 'model', {
      modelName: body.name,
      modelCode: body.code,
      modelId: data.id,
    }, {
      userId: user.id,
      username: user.name,
      resourceId: data.id?.toString(),
      success: true,
      severity: 'low',
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating model:', error);
    
    // 감사 로그 기록 (오류)
    const user = (await getServerSession(authOptions))?.user as any;
    auditLogger.log('model.create', 'model', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      userId: user?.id || 'unknown',
      username: user?.name || 'unknown',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      severity: 'high',
    });
    
    return NextResponse.json(
      { error: `Failed to create model: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 