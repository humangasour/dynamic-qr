import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

// UI test helpers
export class UITestHelpers {
  // Custom render function with providers
  static customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
    return render(ui, {
      // Add any global providers here
      ...options,
    });
  }

  // Helper to create mock event handlers
  static createMockEventHandler() {
    return vi.fn();
  }

  // Helper to create mock form data
  static createMockFormData(data: Record<string, string | Blob>) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  }

  // Helper to simulate user interactions
  static async simulateUserClick(element: HTMLElement) {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }

  static async simulateUserInput(element: HTMLInputElement, value: string) {
    element.value = value;
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  }

  // Helper to wait for async operations in components
  static async waitForAsync() {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // Helper to create mock router
  static createMockRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };
  }

  // Helper to create mock session
  static createMockSession(user: { id: string; email: string; name?: string } | null = null) {
    return {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }
}
