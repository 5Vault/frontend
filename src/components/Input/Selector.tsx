import Select from "react-select";

type OptionType = { label: string; value: string | number };

type SelectorProps = {
    options: Array<OptionType>;
    value: OptionType | null;
    onChange: (value: OptionType | null) => void;
    className?: string;
    placeholder?: string;
    isClearable?: boolean;
}

const Selector = (props: SelectorProps) => {
    return <Select<OptionType>
        options={props.options}
        value={props.value}
        onChange={props.onChange}
        className={props.className}
        placeholder={props.placeholder}
        isClearable={props.isClearable}
        styles={{
            control: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
                borderColor: "#4a5565",
                color: "white",
                minHeight: "40px",
            }),
            option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#4a5565" : "#3f3f3f",
                color: "white",
            }),
            singleValue: (provided) => ({
                ...provided,
                color: "white",
            }),
            menu: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
            }),
            menuPortal: (provided) => ({
                ...provided,
                zIndex: 10000,
            }),
            placeholder: (provided) => ({
                ...provided,
                color: "#adadad",
            }),
        }}
        menuPortalTarget={document.body}
    />
}

export default Selector;