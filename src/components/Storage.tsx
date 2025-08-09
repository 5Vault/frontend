interface storageProps {
  id: string;
  name: string;
  size: number;
  type: string;
}

const Storage = ({ id, name, size, type }: storageProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-160 gap-10 px-24 py-10 border border-zinc-100/10 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <header className="w-full flex justify-between items-center">
        <span className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">{name}</h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">
            Monitor and manage your storage infrastructure.
          </h5>
        </span>
        <span className="flex gap-2">
          {/* Additional controls can be added here */}
        </span>
      </header>
      <div></div>
    </div>
  );
};

export default Storage;
