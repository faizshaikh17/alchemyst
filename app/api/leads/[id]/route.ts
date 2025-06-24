import { NextResponse } from 'next/server';

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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { status } = body;
  const id = params.id;

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  lead.status = status;

  return NextResponse.json(lead);
}
