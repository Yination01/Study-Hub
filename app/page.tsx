import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Study Hub
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Master any subject with smart flashcards and adaptive quizzes.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-xl px-12 py-8 bg-white text-slate-900 hover:bg-slate-100 shadow-2xl">
              Start Studying
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader><CardTitle>Flashcards</CardTitle><CardDescription>Spaced repetition</CardDescription></CardHeader>
            <CardContent>Active recall learning</CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader><CardTitle>Quizzes</CardTitle><CardDescription>Adaptive testing</CardDescription></CardHeader>
            <CardContent>Track progress</CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader><CardTitle>Study Sets</CardTitle><CardDescription>Organized learning</CardDescription></CardHeader>
            <CardContent>Group by topic</CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
