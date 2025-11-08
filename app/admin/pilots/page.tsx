import { PilotApprovalList } from "@/components/admin/pilot-approval-list"
import { AllPilotsList } from "@/components/admin/all-pilots-list"

export default function AdminPilotsPage() {
  return (
    <div className="container mx-auto space-y-12 px-4 py-12">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Pilot Approvals</h1>
        <p className="text-muted-foreground">Review and approve new pilot applications.</p>
      </div>
      <PilotApprovalList />

      <div className="mt-16">
        <AllPilotsList />
      </div>
    </div>
  )
}
