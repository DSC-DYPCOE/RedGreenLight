import { NextResponse } from 'next/server';

export async function POST(req) {
  const { email, password } = await req.json();

  if (email === 'admin' && password === 'admin0088') {
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
}

