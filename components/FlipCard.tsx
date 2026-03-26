'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props { front: string; back: string }
export function FlipCard({ front, back }: Props) {
  const [flipped, setFlipped] = useState(false)
  return (
    <Card className="bg-slate-800/50 border-slate-700 h-48 cursor-pointer group hover:shadow-2xl" onClick={() => setFlipped(!flipped)}>
      <CardContent className="h-full p-0 relative perspective">
        <div className={`absolute inset-0 transition-transform duration-500 ${flipped ? 'rotate-y-180' : ''}`}>
          <div className="bg-indigo-500/20 backdrop-blur-sm h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="text-lg font-semibold mb-4">{front}</div>
            <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); setFlipped(true)}}>Show Answer</Button>
          </div>
        </div>
        <div className={`absolute inset-0 transition-transform duration-500 rotate-y-180 ${flipped ? '' : 'rotate-y-180'}`}>
          <div className="bg-purple-500/20 backdrop-blur-sm h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="text-lg font-semibold mb-4">{back}</div>
            <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); setFlipped(false)}}>Flip Back</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
