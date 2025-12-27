import { NextResponse } from 'next/server';
import { generateAgentResponse } from '@/lib/agent';
import { IncomingMessagePayload } from '@/types/conversation';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IncomingMessagePayload | undefined;

    if (!body || !body.message || !body.channel) {
      return NextResponse.json(
        { error: 'Payload requires channel and message.' },
        { status: 400 },
      );
    }

    const response = generateAgentResponse(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Agent API error', error);
    return NextResponse.json(
      { error: 'Failed to create agent response. Please try again.' },
      { status: 500 },
    );
  }
}
