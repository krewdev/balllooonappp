"use client"

import { OnboardingTutorial } from "./onboarding-tutorial"
import { useState, useEffect } from "react"

type OnboardingTutorialWrapperProps = {
  pilot: {
    id: string
    stripeAccountId: string | null
    approved: boolean
  }
  stripeOnboarded: boolean
}

export function OnboardingTutorialWrapper({ pilot, stripeOnboarded }: OnboardingTutorialWrapperProps) {
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    // Check if tutorial has been completed before
    const tutorialCompleted = localStorage.getItem(`pilot_tutorial_completed_${pilot.id}`)
    
    // Only show tutorial if:
    // 1. Not completed before
    // 2. Pilot is approved
    if (!tutorialCompleted && pilot.approved) {
      setShowTutorial(true)
    }
  }, [pilot.id, pilot.approved])

  const handleComplete = () => {
    localStorage.setItem(`pilot_tutorial_completed_${pilot.id}`, "true")
    setShowTutorial(false)
  }

  if (!showTutorial) {
    return null
  }

  return (
    <OnboardingTutorial 
      pilot={pilot} 
      stripeOnboarded={stripeOnboarded}
      onComplete={handleComplete}
    />
  )
}
