import { z } from "zod";

/**
 * Environment variable schema
 * Validates all required environment variables at startup
 * Prevents silent failures and unclear error messages
 */
const envSchema = z.object({
  // Database URLs
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

  // Authentication (NextAuth v5 uses AUTH_SECRET)
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),

  // Feature flags
  DEMO_MODE: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  
  MOCK_MODE: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * This will throw a clear error at startup if any required variable is missing
 */
let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  try {
    _env = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DEMO_MODE: process.env.DEMO_MODE,
      MOCK_MODE: process.env.MOCK_MODE,
      NODE_ENV: process.env.NODE_ENV,
    });

    return _env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      console.error("");
      const missingVars: string[] = [];
      error.errors.forEach((err) => {
        const varName = err.path.join(".");
        console.error(`  • ${varName}: ${err.message}`);
        missingVars.push(varName);
      });
      console.error("");
      console.error("💡 Check your .env file and ensure all required variables are set.");
      console.error("   See .env.example for reference.");
      console.error("");
      console.error("Missing variables:", missingVars.join(", "));
    }
    throw new Error(`Environment validation failed: ${error instanceof z.ZodError ? error.errors.map(e => e.path.join(".")).join(", ") : "Unknown error"}`);
  }
}

/**
 * Validate environment at startup
 * Call this in your application entry point
 */
export function validateEnv(): void {
  getEnv();
  console.log("✅ Environment validation passed");
}

/**
 * Get safe environment info (without secrets) for logging/debugging
 */
export function getSafeEnvInfo() {
  const env = getEnv();
  return {
    nodeEnv: env.NODE_ENV,
    demoMode: env.DEMO_MODE,
    hasDatabaseUrl: !!env.DATABASE_URL,
    hasDirectUrl: !!env.DIRECT_URL,
    hasAuthSecret: !!env.AUTH_SECRET,
  };
}
