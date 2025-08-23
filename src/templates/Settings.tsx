import InputHidden from "../components/InputHidden";
import useAuthContext from "../hook/useAuthContext";
import Icons from "../utils/Icons";

const SettingsTemplate = () => {
  const { user, key } = useAuthContext();

  return (
    <div className="flex flex-col h-full items-start px-24 py-10 gap-10 overflow-y-auto">
      <header className="w-full flex flex-col">
        <h2 className="text-4xl font-bold">Configuration</h2>
        <h5 className="text-sm text-zinc-400 tracking-wide">
          Manage your profile, API keys, and storage preferences
        </h5>
      </header>

      <div className="rounded-lg p-8 shadow-sm w-full border border-zinc-100/10">
        <div className="flex items-center gap-3 mb-8">
          {Icons.settings}
          <h3 className="text-xl font-semibold">Profile Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user?.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Phone
            </label>
            <input
              type="tel"
              defaultValue={user?.phone || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full h-0.5 bg-gray-200/20 my-8" />
        <div className="flex justify-end mt-8 gap-2">
          <button className="flex items-center gap-2 text-white px-6 py-2 rounded-md bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] hover:bg-[var(--primary-contrast-light)] transition-colors">
            {Icons.edit}
            Edit Profile
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2 rounded-md hover:bg-[var(--primary-contrast-light)] transition-colors">
            {Icons.save}
            Save Profile
          </button>
        </div>
      </div>

      <div className="flex w-full gap-8">
        <div className="rounded-lg p-8 shadow-sm w-full border border-zinc-100/10">
          <div className="flex items-center gap-3 mb-8">
            {Icons.key}
            <h3 className="text-xl font-semibold">API Key</h3>
          </div>
            <div className="mt-2 text-sm text-zinc-400">
              API Key used to authenticate requests to the 5Vault service. Don't share it with anyone.
            </div>

          <div className="w-full h-0.5 bg-gray-200/20 my-4" />
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Secret Access Key
            </label>
            <InputHidden value={key ?? "No Key"} />
          </div>
        </div>

        <div className="rounded-lg p-8 shadow-sm w-full border border-zinc-100/10">
          <div className="flex items-center gap-3 mb-5">
            {Icons.flag}
            <h3 className="text-xl font-semibold">Free Tier</h3>
            <button className="text-sm text-blue-500 hover:underline">
              Upgrade Now
            </button>
          </div>

          <div>            
            <div className="mt-4 text-sm text-zinc-400">
              Upgrade to a premium tier for more storage and advanced features.
            </div>

            <div className="w-full h-0.5 bg-gray-200/20 my-4" />
            <div className="text-sm text-zinc-400">
              Next Charge Date: <strong>2024-12-31</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTemplate;
