import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API routes are working!', 
    timestamp: new Date().toISOString(),
    openaiKey: process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST endpoint working!', 
    timestamp: new Date().toISOString() 
  });
}
