import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  };

  return NextResponse.json({
    message: 'Environment variables check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: envVars,
  });
}
