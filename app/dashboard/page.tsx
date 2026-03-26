// TEST - Delete after confirming works
<div className="p-8 bg-red-500 text-white text-2xl mb-8">
  ✅ MONETIZATION ACTIVE! 
  <br/>Tier: {localStorage.getItem('userTier') || 'student'}
  <br/><Button onClick={() => {
    localStorage.setItem('userTier', 'pro')
    alert('✅ Upgraded to PRO!')
    location.reload()
  }}>TEST UPGRADE</Button>
</div>
  'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { FlipCard } from '@/components/FlipCard'
import { QuizCard } from '@/components/QuizCard'

const flashcards = [
  { id: 1, front: 'What is React?', back: 'JavaScript UI library', category: 'Web Dev' },
  { id: 2, front: 'Next.js benefit?', back: 'Server-side rendering', category: 'Web Dev' },
  { id: 3, front: 'Tailwind CSS?', back: 'Utility-first CSS', category: 'CSS' }
]

const quizzes = [
  { id: 1, title: 'React Basics', questions: 10, score: 85 },
  { id: 2, title: 'JavaScript Quiz', questions: 15, score: 92 }
]

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false)
  const [newCard, setNewCard] = useState({ front: '', back: '', category: '' })

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Dashboard
        </h1>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Flashcards</CardTitle>
              <CardDescription>Practice with spaced repetition</CardDescription>
            </div>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Create</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Flashcard</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Front (Question)" onChange={(e) => setNewCard({...newCard, front: e.target.value})} />
                  <Input placeholder="Back (Answer)" onChange={(e) => setNewCard({...newCard, back: e.target.value})} />
                  <Input placeholder="Category" onChange={(e) => setNewCard({...newCard, category: e.target.value})} />
                  <Button className="w-full">Add Card</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card) => (
                <FlipCard key={card.id} front={card.front} back={card.back} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-2xl">Quizzes</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} {...quiz} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
