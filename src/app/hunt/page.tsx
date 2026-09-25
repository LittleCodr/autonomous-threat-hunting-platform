import { CyberButton } from "@/components/ui/CyberButton";

export default function ThreatHunting() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b border-[#161B22] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Threat Hunting</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">Manual Investigation Engine</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Search Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="panel p-6 neubrutalist-border neubrutalist-shadow space-y-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[#00F0FF]">Hunt Target</h2>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="space-y-2">
                <label className="text-gray-400 block text-xs">ENTITY TYPE</label>
                <select className="w-full bg-[#0D1117] border border-[#161B22] text-gray-200 p-2 focus:border-[#00F0FF] outline-none">
                  <option>USER</option>
                  <option>IP ADDRESS</option>
                  <option>DEVICE</option>
                  <option>PROCESS</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-400 block text-xs">ENTITY VALUE</label>
                <input type="text" placeholder="e.g. alex.morgan" className="w-full bg-[#0D1117] border border-[#161B22] text-gray-200 p-2 focus:border-[#00F0FF] outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-gray-400 block text-xs">TIME RANGE</label>
                <select className="w-full bg-[#0D1117] border border-[#161B22] text-gray-200 p-2 focus:border-[#00F0FF] outline-none">
                  <option>Last 15 Minutes</option>
                  <option>Last 1 Hour</option>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <label className="text-gray-400 block text-xs">SEARCH SCOPE</label>
                <div className="space-y-2 text-gray-300">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#00F0FF]" /> Authentication</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#00F0FF]" /> Network</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#00F0FF]" /> Process Execution</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#00F0FF]" /> Resource Access</label>
                </div>
              </div>
            </div>

            <CyberButton variant="primary" className="w-full mt-4">Execute Hunt</CyberButton>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2">
          <div className="panel h-full border border-dashed border-[#161B22] flex flex-col items-center justify-center text-gray-500 font-mono text-sm min-h-[400px]">
            <div className="text-4xl mb-4 opacity-50">⌖</div>
            <p>Awaiting hunt parameters...</p>
            <p className="text-xs mt-2 opacity-50">Configure target entity to begin investigation.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
