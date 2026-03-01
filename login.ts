import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Store } from '../services/store'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    const user = await Store.checkUserExists(email)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Server error' })
  }
}
