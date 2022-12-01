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
  if (req.method !== 'POST') {
    res.status(405)
    return
  }

  const body = JSON.parse(req.body) as Data

  const data = await prisma.word.create({
    data: { content: body.word }
  })

  res.status(200).json({ word: body.word })
}
