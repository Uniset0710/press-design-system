import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const modelid = searchParams.get('modelid');
    const section = searchParams.get('section');
    
    const params = new URLSearchParams();
    if (modelId) params.append('modelId', modelId);
    if (modelid) params.append('modelid', modelid);
    if (section) params.append('section', section);
    
    const response = await fetch(`${BACKEND_URL}/api/model-options?${params}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('백엔드 API 호출 실패');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Model options API error:', error);
    return NextResponse.json(
      { error: '옵션을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/model-options`, {
      method: 'POST',
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
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Model options API error:', error);
    return NextResponse.json(
      { error: '옵션 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 