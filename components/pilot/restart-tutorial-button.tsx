"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

type RestartTutorialButtonProps = {
  pilotId: string
}

export function RestartTutorialButton({ pilotId }: RestartTutorialButtonProps) {
  const handleRestart = () => {
    localStorage.removeItem(`pilot_tutorial_completed_${pilotId}`)
    window.location.reload()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRestart}>
      <GraduationCap className="mr-2 h-4 w-4" />
      Restart Tutorial
    </Button>
  )
}
