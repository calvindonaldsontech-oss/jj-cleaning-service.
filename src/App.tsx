<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Comments / Special Instructions
  </label>
  <textarea
    rows={3}
    value={comments}
    onChange={(e) => setComments(e.target.value)}
    placeholder="Pets, gate codes, or cleaning notes..."
    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
  />
</div>
