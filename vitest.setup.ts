import '@testing-library/dom'
import { vi } from 'vitest'

// Mocking the environment variables to bypass Zod validation during tests
vi.mock('@/env', () => ({
  clientEnv: {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-id',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'mock-bucket',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'mock-sender',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'mock-app-id',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
  serverEnv: {
    FIREBASE_PROJECT_ID: 'mock-id',
    FIREBASE_CLIENT_EMAIL: 'mock@example.com',
    FIREBASE_PRIVATE_KEY: 'mock-key',
    RESEND_API_KEY: 'mock-resend',
    GOOGLE_DRIVE_ROOT_ID: 'mock-drive',
    GOOGLE_DRIVE_PORTFOLIO_ID: 'mock-portfolio',
    GOOGLE_DRIVE_USUARIOS_ID: 'mock-users',
    GOOGLE_DRIVE_ATAS_ID: 'mock-atas',
    GOOGLE_CALENDAR_ID: 'mock-calendar',
    GOOGLE_BOOKING_CALENDAR_ID: 'mock-booking',
  }
}))
