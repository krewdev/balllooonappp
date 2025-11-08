'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function create(formData: FormData) {
  const content = formData.get('content') as string
  
  if (!content || content.trim().length === 0) {
    return
  }
  
  await prisma.comment.create({
    data: {
      content: content.trim(),
    },
  })
  
  revalidatePath('/comments')
}
