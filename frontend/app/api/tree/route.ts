import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId'); // modelId 파라미터 추출
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    
    // modelId가 있으면 백엔드로 전달
    const backendUrl = modelId 
      ? `http://localhost:3002/api/tree?modelId=${modelId}`
      : 'http://localhost:3002/api/tree';
      
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
    console.error('Error fetching tree data:', error);
    return NextResponse.json({ error: 'Failed to fetch tree data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/tree body:', body);
    const session = await getServerSession(authOptions);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    const response = await fetch('http://localhost:3002/api/tree', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    console.log('POST /api/tree response status:', response.status);
    const text = await response.text();
    console.log('POST /api/tree response text:', text);
    if (!response.ok) {
      throw new Error('Failed to create in backend');
    }
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating tree data:', error);
    return NextResponse.json({ error: 'Failed to create tree data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PUT /api/tree body:', body);
    const session = await getServerSession(authOptions);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    const response = await fetch('http://localhost:3002/api/tree', {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    console.log('PUT /api/tree response status:', response.status);
    const text = await response.text();
    console.log('PUT /api/tree response text:', text);
    if (!response.ok) {
      throw new Error('Failed to update in backend');
    }
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tree data:', error);
    return NextResponse.json({ error: 'Failed to update tree data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    const response = await fetch('http://localhost:3002/api/tree', {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to delete in backend');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting tree data:', error);
    return NextResponse.json({ error: 'Failed to delete tree data' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PATCH /api/tree body:', body);
    const session = await getServerSession(authOptions);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.accessToken) headers['authorization'] = `Bearer ${session.accessToken}`;
    const response = await fetch('http://localhost:3002/api/tree', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    console.log('PATCH /api/tree response status:', response.status);
    const text = await response.text();
    console.log('PATCH /api/tree response text:', text);
    if (!response.ok) {
      throw new Error('Failed to reorder in backend');
    }
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reordering tree data:', error);
    return NextResponse.json({ error: 'Failed to reorder tree data' }, { status: 500 });
  }
} 