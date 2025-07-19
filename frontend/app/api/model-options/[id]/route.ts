import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/model-options/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error('백엔드 API 호출 실패');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Model options API error:', error);
    return NextResponse.json(
      { error: '옵션 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/model-options/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('백엔드 API 호출 실패');
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Model options API error:', error);
    return NextResponse.json(
      { error: '옵션 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 