
declare namespace NodeJS {
  interface ProcessEnv {
    UPLOADTHING_SECRET?: string;
    UPLOADTHING_APP_ID?: string;
    UPLOADTHING_TOKEN?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 