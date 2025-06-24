import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: string;
}

const leadsFile = path.resolve('./leads.json');

function loadLeads(): Lead[] {
  if (fs.existsSync(leadsFile)) {
    return JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
  }
  return [];
}

function saveLeads(leads: Lead[]) {
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
}

export async function GET() {
  const leads = loadLeads();
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, company, source, status } = body;

  if (!name || !email || !source || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const leads = loadLeads();

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
  saveLeads(leads);

  return NextResponse.json(newLead, { status: 201 });
}
