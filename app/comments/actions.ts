'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function create(formData: FormData) {
  const content = formData.get('content') as string
  
  if (!content || content.trim().length === 0) {
    return
  }
  
  await prisma.comment.create({
    data: {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  
  revalidatePath('/comments')
}
