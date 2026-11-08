import { Component, ElementRef, Type, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BadIconButtonComponent } from './bad/icon-button.component';
import { ButtonComponent, IconButtonComponent, PrimaryButtonComponent } from './good/buttons';

describe('LSP - the problem', () => {
  it('a disabled bad icon button still fires click handlers', async () => {
    @Component({
      imports: [BadIconButtonComponent],
      template: `<app-bad-icon-button icon="🛒" [disabled]="true" (click)="clicks = clicks + 1">Add to cart</app-bad-icon-button>`,
    })
    class Host {
      clicks = 0;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.icon-button') as HTMLElement).click();

    expect(fixture.componentInstance.clicks).toBe(1); // 💥 the caller asked for disabled
  });
});

// Contract tests: every variant must behave like a native button.
interface ButtonHost {
  readonly clicks: number;
  readonly disabled: ReturnType<typeof signal<boolean>>;
  readonly button: () => ElementRef<HTMLButtonElement>;
}

@Component({
  imports: [ButtonComponent],
  template: `<button #b appButton [disabled]="disabled()" (click)="clicks = clicks + 1">Add to cart</button>`,
})
class ButtonHostComponent implements ButtonHost {
  clicks = 0;
  readonly disabled = signal(false);
  readonly button = viewChild.required('b', { read: ElementRef<HTMLButtonElement> });
}

@Component({
  imports: [PrimaryButtonComponent],
  template: `<button #b appPrimaryButton [disabled]="disabled()" (click)="clicks = clicks + 1">Add to cart</button>`,
})
class PrimaryHostComponent implements ButtonHost {
  clicks = 0;
  readonly disabled = signal(false);
  readonly button = viewChild.required('b', { read: ElementRef<HTMLButtonElement> });
}

@Component({
  imports: [IconButtonComponent],
  template: `<button #b appIconButton="🛒" [disabled]="disabled()" (click)="clicks = clicks + 1">Add to cart</button>`,
})
class IconHostComponent implements ButtonHost {
  clicks = 0;
  readonly disabled = signal(false);
  readonly button = viewChild.required('b', { read: ElementRef<HTMLButtonElement> });
}

describe.each<[string, Type<ButtonHost>]>([
  ['ButtonComponent', ButtonHostComponent],
  ['PrimaryButtonComponent', PrimaryHostComponent],
  ['IconButtonComponent', IconHostComponent],
])('Button contract: %s', (_name, host) => {
  async function render(disabled = false) {
    const fixture = TestBed.createComponent(host);
    fixture.componentInstance.disabled.set(disabled);
    await fixture.whenStable();
    return { fixture, button: fixture.componentInstance.button().nativeElement };
  }

  it('is a real, accessible button of type "button"', async () => {
    const { button } = await render();

    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button.type).toBe('button');
    expect(button.textContent).toContain('Add to cart');
  });

  it('calls click handlers when enabled', async () => {
    const { fixture, button } = await render();

    button.click();

    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('honours disabled', async () => {
    const { fixture, button } = await render(true);

    button.click();

    expect(button.disabled).toBe(true);
    expect(fixture.componentInstance.clicks).toBe(0);
  });
});
