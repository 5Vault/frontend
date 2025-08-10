import { useParams } from "react-router-dom";

const StorageTemplate = () => {
  const { id } = useParams<{ id?: string }>();
  return (
    <div>
      <h1>Storage</h1>
      {id && <p>Selected Storage ID: {id}</p>}
    </div>
  );
};

export default StorageTemplate;
