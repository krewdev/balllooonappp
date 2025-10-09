import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plane, Calendar, DollarSign } from "lucide-react"

export default function AdminDashboardPage() {
  // Mock data - would come from database
  const stats = {
    totalPilots: 156,
    pendingApprovals: 12,
    totalPassengers: 2847,
    totalMeisters: 23,
    monthlyRevenue: 45600,
    activeSubscriptions: 144,
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pilots</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPilots}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingApprovals} pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPassengers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Festival Meisters</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeisters}</div>
            <p className="text-xs text-muted-foreground">8 upcoming festivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.activeSubscriptions} active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
          <CardHeader>
            <CardTitle>Pilot Approvals</CardTitle>
            <CardDescription>Review and approve pending pilot applications</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/pilots" className="text-sm font-medium text-primary hover:underline">
              View {stats.pendingApprovals} pending applications →
            </a>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage pilots, passengers, and meisters</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/users" className="text-sm font-medium text-primary hover:underline">
              Manage users →
            </a>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
          <CardHeader>
            <CardTitle>Payment Reports</CardTitle>
            <CardDescription>View subscription and payment analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/payments" className="text-sm font-medium text-primary hover:underline">
              View reports →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
