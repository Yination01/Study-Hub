import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain } from 'lucide-react'

interface Props { id: number; title: string; questions: number; score: number }
export function QuizCard({ title, questions, score }: Props) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:shadow-2xl group">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-6 h-6 text-indigo-400" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <Badge>{questions} questions</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-400">{score}%</div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  )
}
