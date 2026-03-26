'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

const TIERS = [
  { name: 'Student Pro', priceMonthly: 9, aiLimit: 'Unlimited', courses: 'All Years' },
  { name: 'External', priceMonthly: 12, aiLimit: 'Unlimited', courses: 'All + External' }
]

export default function Subscribe() {
  const createCheckout = async (tier: string) => {
    const { data } = await supabase.functions.invoke('create-stripe-checkout', {
      body: { tier }
    })
    window.location.href = data.checkoutUrl
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-black text-center mb-20 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <Card key={tier.name} className="bg-slate-800/50 border-slate-700 group hover:shadow-2xl">
              <CardHeader>
                <Badge className="w-fit mb-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                  Most Popular
                </Badge>
                <CardTitle className="text-3xl font-black">${tier.priceMonthly}</CardTitle>
                <p className="text-slate-400">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                    <span>{tier.aiLimit} AI Chat</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                    <span>{tier.courses}</span>
                  </div>
                </div>
                <Button onClick={() => createCheckout(tier.name)} size="lg" className="w-full group-hover:scale-[1.02] transition-all">
                  Get {tier.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
