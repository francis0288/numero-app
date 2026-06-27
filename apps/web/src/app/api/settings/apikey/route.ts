import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export async function PUT(req: Request) {
  await getCurrentUserId()

  const body = await req.json() as { apiKey: string }
  const newKey = body.apiKey?.trim()

  if (!newKey || !newKey.startsWith('sk-ant-')) {
    return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 })
  }

  const envPath = join(process.cwd(), '.env')

  try {
    let envContent = readFileSync(envPath, 'utf8')
    if (envContent.includes('ANTHROPIC_API_KEY=')) {
      envContent = envContent.replace(
        /ANTHROPIC_API_KEY=".*?"/,
        `ANTHROPIC_API_KEY="${newKey}"`
      )
    } else {
      envContent += `\nANTHROPIC_API_KEY="${newKey}"\n`
    }
    writeFileSync(envPath, envContent, 'utf8')
    process.env.ANTHROPIC_API_KEY = newKey
  } catch (err) {
    console.error('Failed to write .env:', err)
    return NextResponse.json({ error: 'Failed to save key' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
