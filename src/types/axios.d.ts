// src/types/axios.d.ts
import 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
      endTime?: number;
      duration?: number;
    };
  }
}
