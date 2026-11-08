import { useState, type ComponentType } from "react";

/** The extension point: a payment option is data + a component. */
export interface PaymentOption {
  readonly id: string;
  readonly label: string;
  readonly Form: ComponentType;
}

interface PaymentOptionsProps {
  readonly options: readonly PaymentOption[];
}

/**
 * ✅ Closed for modification: it renders whatever options it receives.
 * Open for extension: add a new PaymentOption to the list, never edit this file.
 */
export function PaymentOptions({ options }: PaymentOptionsProps) {
  const [selectedId, setSelectedId] = useState(options[0]?.id);
  const selected = options.find((option) => option.id === selectedId);

  return (
    <fieldset>
      <legend>Payment method</legend>
      {options.map((option) => (
        <label key={option.id}>
          <input
            type="radio"
            name="payment-method"
            checked={option.id === selectedId}
            onChange={() => setSelectedId(option.id)}
          />{" "}
          {option.label}
        </label>
      ))}
      {selected && <selected.Form />}
    </fieldset>
  );
}
