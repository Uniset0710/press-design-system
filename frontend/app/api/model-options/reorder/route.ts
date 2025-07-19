import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/model-options/reorder`, {
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
    console.error('Model options reorder API error:', error);
    return NextResponse.json(
      { error: '옵션 순서 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
} 