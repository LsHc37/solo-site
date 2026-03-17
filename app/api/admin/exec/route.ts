import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { error } = await requireAdmin();
  if (error) return error as NextResponse;

  let command: string;
  try {
    const body = await req.json() as { command?: unknown };
    command = String(body.command ?? "");
    if (!command) {
      return NextResponse.json({ error: 'Invalid command' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({ error: error.message, stdout, stderr }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ stdout, stderr }, { status: 200 }));
      }
    });
  });
}
