'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: string;
}

const CRMDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    source: 'manual',
    status: 'new' as Lead['status']
  });
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadLeads = useCallback(async () => {

    try {
      setLoading(true);
      const res = await fetch('/api/leads', { cache: 'no-store' });
      const data = await res.json();
      setLeads(data);
    } catch {
      notify('error', 'Failed to load leads');
    } finally {
      setLoading(false);
    }

  }, [])

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });

      const token = process.env.NEXT_PUBLIC_TOKEN;

      await fetch('https://platform-backend.getalchemystai.com/api/v1/context/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documents: [
            {
              content: `
Lead Name: ${newLead.name}
Email: ${newLead.email}
Company: ${newLead.company || 'N/A'}
Source: ${newLead.source}
Status: ${newLead.status}
Created At: ${new Date().toISOString()}
        `.trim()
            }
          ],
          source: "platform/crm/leads",
          context_type: "resource",
          scope: "internal"
        })
      });


      setNewLead({ name: '', email: '', company: '', source: 'manual', status: 'new' });
      setShowForm(false);
      notify('success', 'Lead created');
      loadLeads();
    } catch {
      notify('error', 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Lead['status']) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      notify('success', 'Status updated');
      loadLeads();
    } catch {
      notify('error', 'Failed to update status');
    }
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      {notification && (
        <div
          className={`fixed flex gap-2 items-center bottom-4 right-4 p-3 rounded border ${notification.type === 'success' ? 'border-green-600' : 'border-red-600'
            }`}
        >
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="ml-2">{notification.message}</span>
        </div>
      )}

      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CRM Dashboard</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center border px-4 py-2 rounded"
        >
          <Plus size={16} /> <span className="ml-2">Add Lead</span>
        </button>
      </header>

      <table className="w-full border border-gray-400 rounded">
        <thead>
          <tr>
            <th className="p-3 text-left border-b border-gray-400">Name</th>
            <th className="p-3 text-left border-b border-gray-400">Company</th>
            <th className="p-3 text-left border-b border-gray-400">Source</th>
            <th className="p-3 text-left border-b border-gray-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-gray-400">
              <td className="p-3">
                {lead.name}
                <br />
                <span className="text-sm text-gray-600">{lead.email}</span>
              </td>
              <td className="p-3">{lead.company || 'N/A'}</td>
              <td className="p-3">{lead.source}</td>
              <td className="p-3">
                <select
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value as Lead['status'])}
                  className="p-1 border border-gray-400 rounded"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="bg-white text-black border border-gray-400 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
            <form onSubmit={createLead} className="space-y-4">
              {['name', 'email', 'company'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize mb-1">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    required={field !== 'company'}
                    value={(newLead as any)[field]}
                    onChange={(e) => setNewLead({ ...newLead, [field]: e.target.value })}
                    className="w-full p-2 border border-gray-400 rounded"
                  />
                </div>
              ))}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 p-2 border border-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 p-2 border border-gray-400 rounded flex justify-center items-center"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMDashboard;
