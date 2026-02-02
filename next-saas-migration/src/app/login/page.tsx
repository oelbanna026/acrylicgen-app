
import LoginForm from '@/components/LoginForm'
import { Box } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="flex items-center gap-2 justify-center mb-4">
            <Box className="w-10 h-10 text-blue-600" />
            <span className="font-bold text-2xl tracking-tight text-gray-900">AcrylicGen</span>
        </Link>
        <p className="text-gray-500 text-sm">Sign in to manage your projects</p>
      </div>
      
      <LoginForm />
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  )
}
