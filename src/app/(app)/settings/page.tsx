export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                disabled
                placeholder="Coming soon..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                placeholder="Coming soon..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Email notifications</span>
              <input type="checkbox" disabled className="w-4 h-4 text-blue-600" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Audit reminders</span>
              <input type="checkbox" disabled className="w-4 h-4 text-blue-600" />
            </label>
          </div>
        </div>

        {/* Placeholder Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🚧 Settings functionality is under development. This is a placeholder page.
          </p>
        </div>
      </div>
    </div>
  );
}
