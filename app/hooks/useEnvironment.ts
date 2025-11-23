'use client';

import { useState, useEffect } from 'react';

// Environment variable status
export type EnvVarStatus = 'valid' | 'invalid' | 'missing' | 'unknown';

// Environment variable info
export interface EnvVarInfo {
  name: string;
  status: EnvVarStatus;
  value?: string;
  message?: string;
  required: boolean;
}

// Environment configuration
export interface EnvironmentConfig {
  supabase: {
    url: EnvVarInfo;
    anonKey: EnvVarInfo;
    status: 'configured' | 'partially-configured' | 'not-configured';
  };
  vercel: {
    url: EnvVarInfo;
    environment: EnvVarInfo;
    status: 'configured' | 'partially-configured' | 'not-configured';
  };
  status: 'ready' | 'warning' | 'error';
  missingRequired: boolean;
}

// Check if a URL is valid
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Check if a Supabase URL is valid
const isValidSupabaseUrl = (url: string): boolean => {
  return isValidUrl(url) && url.includes('.supabase.co');
};

// Check if a Supabase key is valid
const isValidSupabaseKey = (key: string): boolean => {
  // Supabase keys are typically long alphanumeric strings
  return /^[a-zA-Z0-9._-]{20,}$/.test(key);
};

// Hook to check environment variables
export const useEnvironment = (): EnvironmentConfig => {
  const [config, setConfig] = useState<EnvironmentConfig>({
    supabase: {
      url: {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        status: 'unknown',
        required: false
      },
      anonKey: {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        status: 'unknown',
        required: false
      },
      status: 'not-configured'
    },
    vercel: {
      url: {
        name: 'NEXT_PUBLIC_VERCEL_URL',
        status: 'unknown',
        required: false
      },
      environment: {
        name: 'NEXT_PUBLIC_VERCEL_ENV',
        status: 'unknown',
        required: false
      },
      status: 'not-configured'
    },
    status: 'error',
    missingRequired: true
  });

  useEffect(() => {
    // Check Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseUrlStatus: EnvVarInfo = {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      status: 'unknown',
      required: true
    };

    if (!supabaseUrl) {
      supabaseUrlStatus = {
        ...supabaseUrlStatus,
        status: 'missing',
        message: 'Supabase URL is missing'
      };
    } else if (!isValidSupabaseUrl(supabaseUrl)) {
      supabaseUrlStatus = {
        ...supabaseUrlStatus,
        status: 'invalid',
        value: supabaseUrl,
        message: 'Supabase URL is invalid'
      };
    } else {
      supabaseUrlStatus = {
        ...supabaseUrlStatus,
        status: 'valid',
        value: supabaseUrl
      };
    }

    // Check Supabase Anon Key
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let supabaseAnonKeyStatus: EnvVarInfo = {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      status: 'unknown',
      required: true
    };

    if (!supabaseAnonKey) {
      supabaseAnonKeyStatus = {
        ...supabaseAnonKeyStatus,
        status: 'missing',
        message: 'Supabase Anon Key is missing'
      };
    } else if (!isValidSupabaseKey(supabaseAnonKey)) {
      supabaseAnonKeyStatus = {
        ...supabaseAnonKeyStatus,
        status: 'invalid',
        value: '***',
        message: 'Supabase Anon Key is invalid'
      };
    } else {
      supabaseAnonKeyStatus = {
        ...supabaseAnonKeyStatus,
        status: 'valid',
        value: '***'
      };
    }

    // Check Vercel URL
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
    let vercelUrlStatus: EnvVarInfo = {
      name: 'NEXT_PUBLIC_VERCEL_URL',
      status: 'unknown',
      required: false
    };

    if (!vercelUrl) {
      vercelUrlStatus = {
        ...vercelUrlStatus,
        status: 'missing',
        message: 'Vercel URL is missing'
      };
    } else {
      vercelUrlStatus = {
        ...vercelUrlStatus,
        status: 'valid',
        value: vercelUrl
      };
    }

    // Check Vercel Environment
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
    let vercelEnvStatus: EnvVarInfo = {
      name: 'NEXT_PUBLIC_VERCEL_ENV',
      status: 'unknown',
      required: false
    };

    if (!vercelEnv) {
      vercelEnvStatus = {
        ...vercelEnvStatus,
        status: 'missing',
        message: 'Vercel Environment is missing'
      };
    } else {
      vercelEnvStatus = {
        ...vercelEnvStatus,
        status: 'valid',
        value: vercelEnv
      };
    }

    // Determine Supabase status
    let supabaseStatus: 'configured' | 'partially-configured' | 'not-configured' = 'not-configured';
    if (supabaseUrlStatus.status === 'valid' && supabaseAnonKeyStatus.status === 'valid') {
      supabaseStatus = 'configured';
    } else if (supabaseUrlStatus.status === 'valid' || supabaseAnonKeyStatus.status === 'valid') {
      supabaseStatus = 'partially-configured';
    }

    // Determine Vercel status
    let vercelStatus: 'configured' | 'partially-configured' | 'not-configured' = 'not-configured';
    if (vercelUrlStatus.status === 'valid' && vercelEnvStatus.status === 'valid') {
      vercelStatus = 'configured';
    } else if (vercelUrlStatus.status === 'valid' || vercelEnvStatus.status === 'valid') {
      vercelStatus = 'partially-configured';
    }

    // Check if any required variables are missing
    const missingRequired =
      (supabaseUrlStatus.required && supabaseUrlStatus.status !== 'valid') ||
      (supabaseAnonKeyStatus.required && supabaseAnonKeyStatus.status !== 'valid');

    // Determine overall status
    let overallStatus: 'ready' | 'warning' | 'error' = 'warning';
    if (supabaseStatus === 'configured') {
      overallStatus = 'ready';
    }

    // Update config
    setConfig({
      supabase: {
        url: supabaseUrlStatus,
        anonKey: supabaseAnonKeyStatus,
        status: supabaseStatus
      },
      vercel: {
        url: vercelUrlStatus,
        environment: vercelEnvStatus,
        status: vercelStatus
      },
      status: overallStatus,
      missingRequired
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps; // Empty dependency array is fine here as this only needs to run once on mount
  // and doesn&apos;t depend on any props or state

  return config;
};
