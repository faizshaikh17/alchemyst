import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: string;
}

const leads: Lead[] = [];

export async function GET() {
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, company, source, status } = body;

  if (!name || !email || !source || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const newLead: Lead = {
    id: uuidv4(),
    name,
    email,
    company: company || '',
    source,
    status,
    createdAt: new Date().toISOString()
  };

  leads.push(newLead);

  return NextResponse.json(newLead, { status: 201 });
}
