import { useState } from "react";
import { useVariableContext } from "../context/VariableContext";
import { useTranslation } from "react-i18next";

export default function VariableManager() {
  const { variables, addVariable, editVariable, deleteVariable } =
    useVariableContext();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editing) {
      editVariable(editing, value);
      setEditing(null);
    } else {
      addVariable(name, value);
    }
    setName("");
    setValue("");
  };

  const startEdit = (key: string) => {
    setEditing(key);
    setName(key);
    setValue(variables[key]);
  };

  const cancelEdit = () => {
    setEditing(null);
    setName("");
    setValue("");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{t("variables")}</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t("addVariable") + " name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 w-1/3"
        />
        <input
          type="text"
          placeholder={t("addVariable") + " value"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border px-2 py-1 w-1/2"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {editing ? t("save Variable") : t("add Variable")}
        </button>
        {editing && (
          <button
            onClick={cancelEdit}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {Object.entries(variables).map(([key, val]) => (
          <li
            key={key}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <span className="font-semibold">{`{{${key}}}`}</span>={" "}
              <span>{val}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(key)}
                className="text-blue-600 hover:underline"
              >
                {t("editVariable")}
              </button>
              <button
                onClick={() => deleteVariable(key)}
                className="text-red-600 hover:underline"
              >
                {t("deleteVariable")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
