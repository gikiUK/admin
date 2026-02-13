import { ConstantsEditor } from "@/components/constants/constants-editor";
import { getAllGroups } from "@/lib/api/constants";
import { addGroupAction, addValueAction, deleteGroupAction, deleteValueAction, updateValueAction } from "./actions";

export default async function ConstantsPage() {
  const groups = await getAllGroups();

  return (
    <ConstantsEditor
      initialGroups={groups}
      actions={{
        addGroup: addGroupAction,
        deleteGroup: deleteGroupAction,
        addValue: addValueAction,
        updateValue: updateValueAction,
        deleteValue: deleteValueAction
      }}
    />
  );
}
