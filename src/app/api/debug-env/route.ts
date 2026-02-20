import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    DEMO_MODE_raw: process.env.DEMO_MODE,
    DEMO_MODE_type: typeof process.env.DEMO_MODE,
    DEMO_MODE_equals_true: process.env.DEMO_MODE === "true",
    DEMO_MODE_equals_false: process.env.DEMO_MODE === "false",
    NODE_ENV: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('URL')),
  });
}
