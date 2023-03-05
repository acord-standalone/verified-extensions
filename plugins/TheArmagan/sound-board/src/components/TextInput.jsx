import { inputClasses, inputClasses2 } from "@acord/modules/custom";

export function TextInput(props = {}) {
  return (
    <div className={`${inputClasses2?.input}`}>
      <div className={`${inputClasses?.inputWrapper}`}>
        <input type="text" className={`${inputClasses?.inputDefault}`} {...props} />
      </div>
    </div>
  )
}