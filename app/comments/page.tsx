import { prisma } from '@/lib/prisma'
import { create } from './actions'

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Comments</h1>
      
      <form action={create} className="mb-8 space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Add a comment
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your comment..."
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Comment
        </button>
      </form>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">All Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <p className="text-gray-800 mb-2">{comment.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
