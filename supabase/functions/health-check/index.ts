/// <reference path="../types.d.ts" />
// @ts-ignore - Deno uses URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();

    // Test database connection
    let databaseStatus = 'healthy';
    let databaseLatency = 0;
    try {
      const dbStartTime = Date.now();
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('count')
        .limit(1);

      databaseLatency = Date.now() - dbStartTime;

      if (error) {
        databaseStatus = 'unhealthy';
        console.error('Database health check failed:', error);
      }
    } catch (error) {
      databaseStatus = 'unhealthy';
      console.error('Database connection failed:', error);
    }

    // Test storage connection
    let storageStatus = 'healthy';
    let storageLatency = 0;
    try {
      const storageStartTime = Date.now();
      const { data, error } = await supabaseClient.storage
        .from('property-images')
        .list('', { limit: 1 });

      storageLatency = Date.now() - storageStartTime;

      if (error) {
        storageStatus = 'unhealthy';
        console.error('Storage health check failed:', error);
      }
    } catch (error) {
      storageStatus = 'unhealthy';
      console.error('Storage connection failed:', error);
    }

    // Test auth service
    let authStatus = 'healthy';
    let authLatency = 0;
    try {
      const authStartTime = Date.now();
      // Try to get user with an invalid token to test auth service
      const { data, error } = await supabaseClient.auth.getUser('invalid-token');
      authLatency = Date.now() - authStartTime;

      // We expect this to fail with an invalid token, so if it returns an error, auth is working
      if (!error || error.message.includes('invalid') || error.message.includes('expired')) {
        authStatus = 'healthy';
      } else {
        authStatus = 'unhealthy';
      }
    } catch (error) {
      authStatus = 'unhealthy';
      console.error('Auth service health check failed:', error);
    }

    const totalLatency = Date.now() - startTime;
    const overallStatus = databaseStatus === 'healthy' && storageStatus === 'healthy' && authStatus === 'healthy' ? 'healthy' : 'degraded';

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime ? process.uptime() : 0),
      environment: Deno.env.get('ENVIRONMENT') || 'production',
      version: '1.0.0',
      services: {
        database: {
          status: databaseStatus,
          latency: `${databaseLatency}ms`
        },
        storage: {
          status: storageStatus,
          latency: `${storageLatency}ms`
        },
        auth: {
          status: authStatus,
          latency: `${authLatency}ms`
        }
      },
      performance: {
        totalLatency: `${totalLatency}ms`,
        memoryUsage: getMemoryUsage()
      },
      checks: {
        database: databaseStatus === 'healthy',
        storage: storageStatus === 'healthy',
        auth: authStatus === 'healthy'
      }
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return new Response(
      JSON.stringify(healthData),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Health check error:', error);

    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
});

function getMemoryUsage() {
  try {
    // Deno memory usage information
    const memInfo = Deno.memoryUsage();
    return {
      rss: `${Math.round(memInfo.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memInfo.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memInfo.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memInfo.external / 1024 / 1024)}MB`
    };
  } catch (error) {
    return {
      error: 'Memory usage information not available'
    };
  }
}