// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "../../lib/prisma"

type Data = {
  word: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const wordCount = await prisma.word.count() as number
  const skip = Math.floor(Math.random() * wordCount)
  const words = await prisma.word.findMany({
    skip,
    take: 1
  })
  const word = words[0].content as string

  res.status(200).json({ word })
}
