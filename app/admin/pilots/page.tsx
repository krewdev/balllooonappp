import { PilotApprovalList } from "@/components/admin/pilot-approval-list"

export default function AdminPilotsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Pilot Approvals</h1>
        <p className="text-muted-foreground">Review and approve pilot applications</p>
      </div>
      <PilotApprovalList />
    </div>
  )
}
