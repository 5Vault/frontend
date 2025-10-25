import { useState } from "react";
import Icons from "../../utils/Icons";

const InputHidden = ({
  value,
  setValue,
  editable,
}: {
  value: string;
  setValue?: (value: string) => void;
  editable?: boolean;
}) => {
  const [hidden, setHidden] = useState<boolean>(true);

  return (
    <div className="flex items-center">
      <input
        type={hidden ? "password" : "text"}
        className="min-w-110 w-full"
        name="hiddenInput"
        value={value}
        onChange={
          editable && setValue ? (e) => setValue(e.target.value) : undefined
        }
        readOnly={!editable}
        onFocus={(e) => {
          if (!editable) e.target.blur();
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (setValue) {
            setValue(hidden ? value : "");
          }
          setHidden(!hidden);
        }}
      >
        {hidden ? Icons.openEye : Icons.closeEye}
      </button>
    </div>
  );
};

export default InputHidden;
