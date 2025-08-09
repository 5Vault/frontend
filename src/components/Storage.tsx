import Icons from "../utils/Icons";

interface storageProps {
  id: string;
  name: string;
  used: number;
  size: number;
  totalFiles: number;
  lastAccessed: Date;
}

const Storage = ({
  id,
  name,
  size,
  used,
  totalFiles,
  lastAccessed,
}: storageProps) => {
  const daysSinceLastAccess = Math.floor(
    (new Date().getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex flex-col items-center justify-center w-160 gap-10 px-14 py-10 border border-zinc-100/10 rounded-lg shadow-md hover:shadow-lg hover:scale-102 transition-all duration-200" onClick={() => {window.location.href = `/storage/${id}`}}>
      <header className="w-full flex justify-between items-center">
        <span className="flex gap-4 justify-center items-center">
          {Icons.storage2}
          <h2 className="text-4xl font-bold">{name}</h2>
        </span>
        <span className="text-sm text-zinc-400">active</span>
      </header>
      <div className="w-full flex flex-col gap-1">
        <div className="flex w-full justify-between">
          <span className="flex gap-2 items-center text-sm text-zinc-400">
            {Icons.drive} Storage
          </span>
          <span className="text-sm text-zinc-400">
            {used} GB / <b>{size} GB</b>
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400"
            style={{ width: `${(used / size) * 100}%` }}
          />
        </div>
        <div className="flex justify-around items-center mt-4">
          <span className="flex flex-col text-sm text-zinc-400 justify-center items-center">
            <h2 className="font-bold text-3xl flex">{totalFiles}</h2>
            files
          </span>
          <span className="flex flex-col text-sm text-zinc-400 justify-center items-center">
            <h2 className="font-bold text-2xl flex">{daysSinceLastAccess}d</h2>
            Last Access
          </span>
        </div>
      </div>
    </div>
  );
};

export default Storage;
