import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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
    const body = await request.json();
    console.log('Creating model with data:', body);
    
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
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('POST response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to create model' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Created model:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: `Failed to create model: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 