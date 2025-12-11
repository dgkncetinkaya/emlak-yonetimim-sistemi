/// <reference types="https://deno.land/x/types/deno.d.ts" />

declare global {
  namespace Deno {
    export function serve(handler: (request: Request) => Response | Promise<Response>): void;
    export const env: {
      get(key: string): string | undefined;
    };
    export const memoryUsage: () => {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  }

  // Add process object for compatibility
  const process: {
    uptime?: () => number;
  };
}

declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    from(table: string): any;
    auth: {
      getUser(token?: string): Promise<{ data: { user: any } | null; error: any }>;
    };
    storage: {
      from(bucket: string): {
        upload(path: string, file: File | Blob, options?: any): Promise<{ data: any; error: any }>;
        remove(paths: string[]): Promise<{ data: any; error: any }>;
      };
    };
  }

  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

export { };