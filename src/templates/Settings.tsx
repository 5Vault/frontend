const SettingsTemplate = () => {
  return (
    <div className="flex flex-col h-full items-center px-24 py-10 gap-10">
      <header className="w-full flex justify-between items-center">
        <span className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">Settings</h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">
            Manage your preferences and configurations
          </h5>
        </span>
      </header>
    </div>
  );
};

export default SettingsTemplate;
