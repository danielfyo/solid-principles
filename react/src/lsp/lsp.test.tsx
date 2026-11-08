import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { IconButton as BadIconButton } from "./bad/Buttons";
import { Button, IconButton, PrimaryButton, type ButtonProps } from "./good/Buttons";

describe("LSP - the problem", () => {
  it("a disabled bad IconButton still fires onClick", async () => {
    const onClick = vi.fn();
    render(
      <BadIconButton icon="🛒" disabled onClick={onClick}>
        Add to cart
      </BadIconButton>,
    );

    await userEvent.click(screen.getByText(/Add to cart/));

    expect(onClick).toHaveBeenCalled(); // 💥 the caller asked for disabled
  });
});

// Contract tests: every variant must behave like the base Button.
type ButtonComponent = ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

const CartIconButton = forwardRef<HTMLButtonElement, ButtonProps>(function CartIconButton(props, ref) {
  return <IconButton ref={ref} icon="🛒" {...props} />;
});

const variants: Array<[string, ButtonComponent]> = [
  ["Button", Button],
  ["PrimaryButton", PrimaryButton],
  ["IconButton", CartIconButton],
];

describe.each(variants)("Button contract: %s", (_name, Variant) => {
  it("is a real, accessible button", () => {
    render(<Variant>Add to cart</Variant>);

    expect(screen.getByRole("button", { name: /Add to cart/ })).toHaveAttribute("type", "button");
  });

  it("calls onClick when enabled", async () => {
    const onClick = vi.fn();
    render(<Variant onClick={onClick}>Add to cart</Variant>);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("honours disabled", async () => {
    const onClick = vi.fn();
    render(
      <Variant disabled onClick={onClick}>
        Add to cart
      </Variant>,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Variant ref={ref}>Add to cart</Variant>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
