'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchTiers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*')
    setUsers(data || [])
  }

  const fetchTiers = async () => {
    const { data } = await supabase.from('tiers').select('*')
    setTiers(data || [])
  }

  // BULK ACTIONS
  const approveAll = async () => {
    setLoading(true)
    await supabase.rpc('approve_all_users')
    fetchUsers()
    setLoading(false)
  }

  const upgradeAllToPro = async () => {
    setLoading(true)
    await supabase.from('users').update({ tier: 'student_pro' }).neq('tier', 'superuser')
    fetchUsers()
    setLoading(false)
  }

  const changeUserTier = async (userId: string, newTier: string) => {
    await supabase.from('users').update({ tier: newTier }).eq('id', userId)
    fetchUsers()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        Superuser Admin
      </h1>

      {/* BULK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-0">
          <Button onClick={approveAll} disabled={loading} className="h-16 text-lg">
            ✅ Approve ALL
          </Button>
          <Button onClick={upgradeAllToPro} disabled={loading} className="h-16 text-lg bg-green-600">
            👑 Upgrade ALL to Pro
          </Button>
          <Button onClick={() => supabase.from('users').update({ ai_messages_used: 0 })} className="h-16 text-lg bg-blue-600">
            🔄 Reset AI Usage
          </Button>
          <Button onClick={fetchUsers} className="h-16 text-lg bg-purple-600">
            🔄 Refresh
          </Button>
        </CardContent>
      </Card>

      {/* USER MANAGEMENT */}
      <Card>
        <CardHeader>
          <CardTitle>User Management ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Current Tier</TableHead>
                <TableHead>AI Used</TableHead>
                <TableHead>Change Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.tier === 'student_pro' ? 'default' : 'secondary'}>
                      {user.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.ai_messages_used}/day</TableCell>
                  <TableCell>
                    <select 
                      onChange={(e) => changeUserTier(user.id, e.target.value)}
                      className="border p-2 rounded bg-slate-800 border-slate-600"
                    >
                      <option value="student">Student</option>
                      <option value="student_pro">Pro</option>
                      <option value="external">External</option>
                      <option value="superuser">Superuser</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* TIER EDITOR */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Pricing (Superuser Edit)</CardTitle>
        </CardHeader>
        <CardContent>
          {tiers.map((tier: any) => (
            <div key={tier.id} className="flex gap-4 items-center p-4 border-b border-slate-700 last:border-b-0">
              <span className="font-bold w-24">{tier.name}</span>
              <Input 
                type="number" 
                defaultValue={tier.price_monthly}
                className="w-32"
                onBlur={(e) => supabase.from('tiers').update({ price_monthly: e.target.value }).eq('name', tier.name)}
              />
              <Input 
                type="number" 
                placeholder="AI Limit"
                defaultValue={tier.ai_limit}
                className="w-24"
                onBlur={(e) => supabase.from('tiers').update({ ai_limit: e.target.value }).eq('name', tier.name)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
