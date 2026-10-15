import { Code, Mail, MessageSquare, Calendar, Briefcase, Webhook } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Greenhouse', category: 'ATS Adapter', icon: Briefcase, status: 'Active', color: 'bg-green-100 text-green-700' },
  { name: 'Workday', category: 'ATS Adapter', icon: Briefcase, status: 'Ready', color: 'bg-blue-100 text-blue-700' },
  { name: 'Gmail', category: 'Communication', icon: Mail, status: 'Ready', color: 'bg-red-100 text-red-700' },
  { name: 'Slack', category: 'Communication', icon: MessageSquare, status: 'Ready', color: 'bg-purple-100 text-purple-700' },
  { name: 'Google Calendar', category: 'Scheduling', icon: Calendar, status: 'Ready', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'GitHub', category: 'Verification', icon: Code, status: 'Active', color: 'bg-gray-100 text-gray-700' },
  { name: 'Generic Webhook', category: 'Custom', icon: Webhook, status: 'Active', color: 'bg-indigo-100 text-indigo-700' },
];

export default function IntegrationsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-500">Connect JobNinjas to your ATS, communication, and scheduling ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {INTEGRATIONS.map(int => (
          <div key={int.name} className="bg-card rounded-xl border border-gray-200 p-6 flex flex-col hover:border-indigo-300 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-lg ${int.color} flex items-center justify-center mb-4`}>
              <int.icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{int.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{int.category}</p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                int.status === 'Demo Connected' ? 'bg-green-50 text-green-700 border border-green-200' :
                int.status === 'Available' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
                {int.status}
              </span>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
