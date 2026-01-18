'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@repo/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { useToast } from '@repo/ui/hooks/use-toast'
import { login, signup } from '@/app/auth/actions'

const userAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
})

type FormData = z.infer<typeof userAuthSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('login')
  const { toast } = useToast()
  const router = useRouter()

  async function handleLogin(formData: FormData) {
    setIsLoading(true)

    const form = new FormData()
    form.append('email', formData.email)
    form.append('password', formData.password)

    const result = await login(form)
    setIsLoading(false)

    if (result?.error) {
      return toast({
        title: 'Something went wrong.',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  async function handleSignup(formData: FormData) {
    setIsLoading(true)

    const form = new FormData()
    form.append('email', formData.email)
    form.append('password', formData.password)
    if (formData.fullName) {
      form.append('fullName', formData.fullName)
    }

    const result = await signup(form)
    setIsLoading(false)

    if (result?.error) {
      return toast({
        title: 'Something went wrong.',
        description: result.error,
        variant: 'destructive',
      })
    }

    if (result?.message) {
        toast({
            title: 'Success!',
            description: result.message,
        })
        setActiveTab('login')
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Expense Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your email simply to login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleLogin({
                      email: formData.get('email') as string,
                      password: formData.get('password') as string,
                    })
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" placeholder="m@example.com" required type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" required type="password" />
                  </div>
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading && (
                       <span className="mr-2 h-4 w-4 animate-spin">⚪</span>
                    )}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create a new account to track expenses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                   onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleSignup({
                      email: formData.get('email') as string,
                      password: formData.get('password') as string,
                      fullName: formData.get('fullName') as string,
                    })
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" placeholder="m@example.com" required type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" required type="password" minLength={6} />
                  </div>
                   <Button className="w-full" disabled={isLoading}>
                    {isLoading && (
                       <span className="mr-2 h-4 w-4 animate-spin">⚪</span>
                    )}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
