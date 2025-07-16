import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { auditLogger } from '@/utils/audit';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(`${API_BASE}/api/models/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // 감사 로그 기록 (실패)
      auditLogger.log('model.update', 'model', {
        modelId: params.id,
        modelName: body.name,
        modelCode: body.code,
      }, {
        userId: user.id,
        username: user.name,
        resourceId: params.id,
        success: false,
        errorMessage: errorData.error || 'Failed to update model',
        severity: 'medium',
      });
      
      return NextResponse.json(
        { error: errorData.error || '기종 수정에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 감사 로그 기록 (성공)
    auditLogger.log('model.update', 'model', {
      modelId: params.id,
      modelName: body.name,
      modelCode: body.code,
    }, {
      userId: user.id,
      username: user.name,
      resourceId: params.id,
      success: true,
      severity: 'low',
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating model:', error);
    
    // 감사 로그 기록 (오류)
    const user = (await getServerSession(authOptions))?.user as any;
    auditLogger.log('model.update', 'model', {
      modelId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      userId: user?.id || 'unknown',
      username: user?.name || 'unknown',
      resourceId: params.id,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      severity: 'high',
    });
    
    return NextResponse.json(
      { error: '기종 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(`${API_BASE}/api/models/${params.id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // 감사 로그 기록 (실패)
      auditLogger.log('model.delete', 'model', {
        modelId: params.id,
      }, {
        userId: user.id,
        username: user.name,
        resourceId: params.id,
        success: false,
        errorMessage: errorData.error || 'Failed to delete model',
        severity: 'medium',
      });
      
      return NextResponse.json(
        { error: errorData.error || '기종 삭제에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 감사 로그 기록 (성공)
    auditLogger.log('model.delete', 'model', {
      modelId: params.id,
    }, {
      userId: user.id,
      username: user.name,
      resourceId: params.id,
      success: true,
      severity: 'medium',
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting model:', error);
    
    // 감사 로그 기록 (오류)
    const user = (await getServerSession(authOptions))?.user as any;
    auditLogger.log('model.delete', 'model', {
      modelId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      userId: user?.id || 'unknown',
      username: user?.name || 'unknown',
      resourceId: params.id,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      severity: 'high',
    });
    
    return NextResponse.json(
      { error: '기종 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 