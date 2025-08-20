import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function AdminInventory() {
  const [assets, setAssets] = useState([])
  const [cons, setCons] = useState([])
  const [assetForm, setAssetForm] = useState({ tag: '', name: '', category: '', location: '' })
  const [consForm, setConsForm] = useState({ sku: '', name: '', stock: 0, unit: 'pcs' })
  const [issueForm, setIssueForm] = useState({ item: '', qty: 1, issuedTo: '', purpose: '' })
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try {
      const [{ data: a }, { data: c }] = await Promise.all([
        api.get('/inventory/assets'),
        api.get('/inventory/consumables'),
      ])
      setAssets(a); setCons(c)
    } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  async function createAsset(e) {
    e.preventDefault()
    try { await api.post('/inventory/assets', assetForm); setAssetForm({ tag:'', name:'', category:'', location:'' }); load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }
  async function createCons(e) {
    e.preventDefault()
    try { await api.post('/inventory/consumables', consForm); setConsForm({ sku:'', name:'', stock:0, unit:'pcs' }); load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }
  async function issue(e) {
    e.preventDefault()
    try { await api.post('/inventory/issues', issueForm); setIssueForm({ item:'', qty:1, issuedTo:'', purpose:'' }); load() } catch (e) { setErr(e?.response?.data?.message || e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="space-y-8">
      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Assets</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <form onSubmit={createAsset} className="grid sm:grid-cols-5 gap-3 mb-4">
          <input placeholder="Tag" value={assetForm.tag} onChange={e=>setAssetForm({...assetForm,tag:e.target.value})} className="input" />
          <input placeholder="Name" value={assetForm.name} onChange={e=>setAssetForm({...assetForm,name:e.target.value})} className="input" />
          <input placeholder="Category" value={assetForm.category} onChange={e=>setAssetForm({...assetForm,category:e.target.value})} className="input" />
          <input placeholder="Location" value={assetForm.location} onChange={e=>setAssetForm({...assetForm,location:e.target.value})} className="input" />
          <button className="btn">Add Asset</button>
        </form>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="py-2">Tag</th><th>Name</th><th>Category</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              {assets.map(a=> (
                <tr key={a._id} className="border-b"><td className="py-1">{a.tag}</td><td>{a.name}</td><td>{a.category}</td><td>{a.location}</td><td>{a.status}</td></tr>
              ))}
              {assets.length===0 && <tr><td className="py-3 text-muted" colSpan={5}>No assets</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Consumables</h2>
        <form onSubmit={createCons} className="grid sm:grid-cols-5 gap-3 mb-4">
          <input placeholder="SKU" value={consForm.sku} onChange={e=>setConsForm({...consForm,sku:e.target.value})} className="input" />
          <input placeholder="Name" value={consForm.name} onChange={e=>setConsForm({...consForm,name:e.target.value})} className="input" />
          <input type="number" placeholder="Stock" value={consForm.stock} onChange={e=>setConsForm({...consForm,stock:+e.target.value})} className="input" />
          <input placeholder="Unit" value={consForm.unit} onChange={e=>setConsForm({...consForm,unit:e.target.value})} className="input" />
          <button className="btn">Add Item</button>
        </form>

        <form onSubmit={issue} className="grid sm:grid-cols-4 gap-3 mb-4">
          <select value={issueForm.item} onChange={e=>setIssueForm({...issueForm,item:e.target.value})} className="input">
            <option value="">Select item</option>
            {cons.map(c=> <option key={c._id} value={c._id}>{c.name} (stock {c.stock})</option>)}
          </select>
          <input type="number" min="1" value={issueForm.qty} onChange={e=>setIssueForm({...issueForm,qty:+e.target.value})} className="input" />
          <input placeholder="Issued To" value={issueForm.issuedTo} onChange={e=>setIssueForm({...issueForm,issuedTo:e.target.value})} className="input" />
          <button className="btn">Issue</button>
        </form>

        <ul className="text-sm grid sm:grid-cols-2 gap-2">
          {cons.map(c=> (
            <li key={c._id} className="border rounded p-2">{c.name} — stock {c.stock} {c.unit}</li>
          ))}
          {cons.length===0 && <div className="text-muted">No consumables</div>}
        </ul>
      </div>
    </div>
  )
}
